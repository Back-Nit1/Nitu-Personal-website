import { nodes, get, childrenOf, pathTo, relatedOf, sectionOf } from '../content/index.ts'

export interface Pt {
  x: number
  y: number
}
export type Side = 'left' | 'right' | 'above' | 'below'

export interface Layout {
  /** World coordinates, nitu at the origin. */
  pos: Record<string, Pt>
  /** Which side of its core a node's label sits on. */
  side: Record<string, Side>
  /** Decorative relay points and their thin connections. */
  relays: Pt[]
  relayEdges: [Pt, Pt][]
}

const rad = (deg: number) => (deg * Math.PI) / 180

// Hand-placed so the root reads as an organism, not a six-spoke wheel.
const SECTIONS: Record<'landscape' | 'portrait', Record<string, Pt>> = {
  landscape: {
    story: { x: -215, y: -175 },
    research: { x: 170, y: -190 },
    projects: { x: 330, y: 20 },
    connect: { x: 95, y: 205 },
    offduty: { x: -200, y: 185 },
    experience: { x: -335, y: -10 },
  },
  portrait: {
    story: { x: -105, y: -180 },
    research: { x: 110, y: -235 },
    projects: { x: 125, y: -20 },
    connect: { x: 85, y: 215 },
    offduty: { x: -100, y: 245 },
    experience: { x: -125, y: 62 },
  },
}

// Small deterministic PRNG so the decorative field is identical on every load.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cache: Record<string, Layout> = {}

/**
 * `compact` (stacked layout): children sit in a column beside their parent.
 * `portrait` (phone width): the six branches are arranged tall rather than wide.
 */
export function buildLayout(compact: boolean, portrait = compact): Layout {
  return (cache[`${compact}${portrait}`] ??= compute(compact, portrait))
}

function compute(compact: boolean, portrait: boolean): Layout {
  const pos: Record<string, Pt> = { root: { x: 0, y: 0 }, ...SECTIONS[portrait ? 'portrait' : 'landscape'] }
  const side: Record<string, Side> = { root: 'below' }

  /** Fan a node's children outward along `dir` (degrees, y down). */
  function fan(id: string, dir: number, depth: number) {
    const kids = childrenOf(id)
    if (!kids.length) return
    const p = pos[id]
    const n = kids.length
    const deep = depth > 1
    const r = deep ? 150 : id === 'projects' ? 250 : 195
    const spread = Math.min(deep ? 110 : 156, (deep ? 30 : 40) * (n - 1))
    let angles = kids.map((_, i) => dir + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread))
    // Reading order: first child topmost (or leftmost when the fan runs sideways).
    const a0 = rad(angles[0])
    const a1 = rad(angles[n - 1])
    const dy = Math.sin(a1) - Math.sin(a0)
    const dx = Math.cos(a1) - Math.cos(a0)
    if ((Math.abs(dy) > Math.abs(dx) ? dy : dx) < 0) angles = angles.reverse()
    if (compact) {
      // Narrow screens: a bowed column beside the parent, one label per line.
      const out = dir === 180 ? -1 : 1
      kids.forEach((k, i) => {
        const t = n === 1 ? 0 : (2 * i) / (n - 1) - 1
        pos[k.id] = { x: Math.round(p.x + out * (78 + 34 * (1 - t * t))), y: Math.round(p.y + t * 31 * (n - 1)) }
        side[k.id] = childrenOf(k.id).length ? 'above' : out < 0 ? 'left' : 'right'
        fan(k.id, dir, depth + 1)
      })
      return
    }
    kids.forEach((k, i) => {
      // Alternate the radius a little: staggered, and labels get more room.
      const rr = r * (n > 2 && i % 2 ? 1.12 : 0.94)
      const a = rad(angles[i])
      pos[k.id] = { x: Math.round(p.x + rr * Math.cos(a)), y: Math.round(p.y + rr * Math.sin(a)) }
      fan(k.id, angles[i], depth + 1)
    })
  }

  for (const s of childrenOf('root')) {
    const p = pos[s.id]
    // Narrow screens fan sideways only, so siblings stack vertically and labels never collide.
    fan(s.id, compact ? (p.x < 0 ? 180 : 0) : (Math.atan2(p.y, p.x) * 180) / Math.PI, 1)
  }

  for (const n of nodes) {
    if (!n.parent) continue
    const p = pos[n.id]
    const q = pos[n.parent]
    const dx = p.x - q.x
    const dy = p.y - q.y
    if (compact) side[n.id] ??= dy < 0 ? 'above' : 'below'
    else if (Math.abs(dx) > Math.abs(dy) * 0.7) side[n.id] = dx > 0 ? 'right' : 'left'
    else side[n.id] = dy > 0 ? 'below' : 'above'
  }
  // Branch nodes keep their label clear of the children that fan out past them.
  if (!compact) {
    side.projects = 'above'
    side.experience = 'above'
    for (const g of childrenOf('projects')) side[g.id] = pos[g.id].y < pos.projects.y ? 'above' : 'below'
  }

  // Decorative relays: scattered between real nodes, never on top of one.
  const rand = mulberry32(20281)
  const taken = Object.values(pos)
  const relays: Pt[] = []
  const [rx, ry] = portrait ? [230, 420] : [620, 380]
  for (let tries = 0; relays.length < 56 && tries < 6000; tries++) {
    const a = rand() * Math.PI * 2
    // A lobed outline, not an ellipse: the field reads as one organ.
    const d = (0.1 + 0.95 * Math.sqrt(rand())) * (1 + 0.16 * Math.sin(3 * a + 1) + 0.1 * Math.sin(5 * a + 2))
    const p = { x: Math.round(Math.cos(a) * rx * d), y: Math.round(Math.sin(a) * ry * d) }
    if ([...taken, ...relays].every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 46)) relays.push(p)
  }
  const anchors = [...taken, ...relays]
  const relayEdges: [Pt, Pt][] = relays.flatMap((p) =>
    anchors
      .filter((q) => q !== p)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
      .slice(0, 2)
      .map((q) => [p, q] as [Pt, Pt]),
  )

  return { pos, side, relays, relayEdges }
}

// --- View state: what a route shows ---

export interface View {
  /** Root → … → active. */
  path: string[]
  /** Labelled and interactive. Everything else rests as a dormant point. */
  awake: Set<string>
  /** Awake but outside the active branch. */
  dim: Set<string>
  /** Cross-connected to the active node. */
  related: Set<string>
  /** Nodes the camera frames. */
  focus: string[]
}

/** `featured`: show the fast-path satellites at the root, when there is room for them. */
export function viewOf(active: string, compact: boolean, featured = !compact): View {
  const path = pathTo(active).map((n) => n.id)
  const inPath = new Set(path)
  const related = new Set(active === 'root' ? [] : relatedOf(active))
  const atRoot = active === 'root'
  const section = sectionOf(active)

  const awake = new Set<string>()
  const dim = new Set<string>()
  const parentOfActive = get(active).parent
  const isLeaf = !childrenOf(active).length
  for (const n of nodes) {
    const up = atRoot
      ? n.kind === 'root' || n.kind === 'section' || (featured && n.featured)
      : compact
        ? // Narrow screens show one branch at a time: the path, its children, a leaf's siblings.
          inPath.has(n.id) || n.parent === active || (isLeaf && n.parent === parentOfActive)
        : n.kind === 'root' || n.kind === 'section' || inPath.has(n.parent!) || related.has(n.id)
    if (!up) continue
    awake.add(n.id)
    if (!atRoot && n.kind !== 'root' && sectionOf(n.id) !== section && !related.has(n.id)) dim.add(n.id)
  }

  const kids = childrenOf(active).map((n) => n.id)
  const node = get(active)
  const siblings = childrenOf(node.parent ?? '').map((n) => n.id)
  const focus = atRoot
    ? ['root', ...kids, ...(featured ? nodes.filter((n) => n.featured).map((n) => n.id) : [])]
    : compact
      ? // Frame the column being read; the path back leads off toward the parent.
        kids.length ? [active, ...kids] : [node.parent!, ...siblings]
      : kids.length
        ? [active, node.parent!, ...kids]
        : // A leaf keeps its siblings and the way back in frame.
          [...path.slice(-3, -1), ...siblings]

  return { path, awake, dim, related, focus }
}

// --- Camera ---

export interface Camera {
  x: number
  y: number
  z: number
}
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Fit the focused nodes into `rect`, leaving `pad` screen pixels for labels. */
export function fit(layout: Layout, focus: string[], rect: Rect, pad: Pt, lean?: string): Camera {
  const pts = focus.map((id) => layout.pos[id])
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const z = Math.min(
    1.9,
    Math.max(0.35, Math.min((rect.w - 2 * pad.x) / Math.max(x1 - x0, 1), (rect.h - 2 * pad.y) / Math.max(y1 - y0, 1))),
  )
  let cx = (x0 + x1) / 2
  let cy = (y0 + y1) / 2
  // Drift a little toward the selected leaf: travel without losing its siblings.
  if (lean) {
    cx += (layout.pos[lean].x - cx) * 0.16
    cy += (layout.pos[lean].y - cy) * 0.16
  }
  return { x: rect.x + rect.w / 2 - z * cx, y: rect.y + rect.h / 2 - z * cy, z }
}

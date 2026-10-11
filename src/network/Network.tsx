import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent as RPointerEvent,
} from 'react'
import { nodes, childrenOf, crossEdges, leafCount, pathTo, routeOf, sectionOf } from '../content/index.ts'
import { buildLayout, fit, viewOf, type Pt, type Rect } from './layout.ts'

interface Props {
  active: string
  /** Stacked layout: one branch at a time, children in a column. */
  compact: boolean
  /** Phone width: branches arranged tall. */
  portrait: boolean
  /** Stage size in pixels. */
  w: number
  h: number
  /** The part of the stage the camera may use (the rest sits under the reading panel). */
  rect: Rect
}

const line = (a: Pt, b: Pt) => `M${a.x} ${a.y}L${b.x} ${b.y}`

const treeEdges = nodes.filter((n) => n.parent).map((n) => [n.parent!, n.id] as const)
/** Each flash lane repeats on its own beat (seconds); the dash itself crosses in ~a quarter of it. */
const beat = (g: number) => ({ dur: 8 + ((g * 7) % 5) * 1.5, lag: (g * 3.17) % 8 })
const TRAVEL = 0.25
const allIds = nodes.map((n) => n.id)

/** The quiet label under a node's title. Static, so computed once. */
const subs = new Map(
  nodes.map((n) => {
    if (n.kind === 'root') return [n.id, n.eyebrow] as const
    if (!childrenOf(n.id).length) return [n.id, undefined] as const
    const c = leafCount(n.id)
    return [n.id, n.id === 'projects' || n.kind === 'group' ? `${c} projects` : `${c} entries`] as const
  }),
)

/** Deal the connections that carry signals into lanes, one beat each. */
function lanes(layout: ReturnType<typeof buildLayout>) {
  const lane: { section?: string; edges: string[] }[] = []
  const laneOf: Record<string, number> = {}
  const index = new Map<string, number>()
  const used = new Map<string, number>()
  for (const [a, b] of treeEdges) {
    const section = sectionOf(b) ?? ''
    // Two lanes per branch, alternating, so a branch never fires all at once.
    const n = used.get(section) ?? 0
    used.set(section, n + 1)
    const key = `${section}:${n % 2}`
    if (!index.has(key)) index.set(key, lane.push({ section, edges: [] }) - 1)
    const at = index.get(key)!
    lane[at].edges.push(line(layout.pos[a], layout.pos[b]))
    laneOf[b] = at
  }
  // Relay edges: every twelfth one, in two quiet white lanes.
  const first = lane.push({ edges: [] }, { edges: [] }) - 2
  layout.relayEdges.forEach(([a, b], i) => i % 12 === 0 && lane[first + ((i / 12) % 2)].edges.push(line(a, b)))
  return { flash: lane.map((l) => ({ d: l.edges.join(''), section: l.section })), laneOf }
}

/** The visitor's own camera move, applied on top of the one the route chose. */
const HOME = { dx: 0, dy: 0, k: 1, all: false }

type Fire = { animationDuration: string; animationDelay: string }

interface NodeProps {
  id: string
  title: string
  sub?: string
  href: string
  kind: string
  section?: string
  side: string
  state: string
  dim: boolean
  related: boolean
  inert: boolean
  current: boolean
  x: number
  y: number
  delay: number
  fire?: Fire
}

/** One neuron. Memoized on primitives, so hovering elsewhere never re-renders it. */
const NodeLink = memo(function NodeLink(p: NodeProps) {
  const style = {
    transform: `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`,
    '--bd': `${p.delay}ms`,
  } as CSSProperties
  return (
    <a
      id={`node-${p.id}`}
      href={p.href}
      className="node"
      style={style}
      data-kind={p.kind}
      data-section={p.section}
      data-side={p.side}
      data-state={p.state}
      data-dim={p.dim || undefined}
      data-related={p.related || undefined}
      // Dormant points are decoration until their branch opens.
      inert={p.inert}
      aria-current={p.current ? 'page' : undefined}
    >
      <span className={`core${p.fire ? ' fires' : ''}`} style={p.fire} aria-hidden="true" />
      <span className="label">
        <span className="name">{p.title}</span>
        {p.sub && <span className="sub">{p.sub}</span>}
      </span>
    </a>
  )
})

/** The node id a pointer or focus event landed inside, if any. */
const nodeIdOf = (t: EventTarget | null): string | null =>
  (t as Element | null)?.closest?.('a.node')?.id.slice(5) ?? null

export const Network = memo(function Network({ active, compact, portrait, w, h, rect }: Props) {
  const [hot, setHot] = useState<string | null>(null)
  const [user, setUser] = useState(HOME)
  const [dragging, setDragging] = useState(false)
  const net = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const roomy = w >= 1200
  const layout = buildLayout(compact, portrait)
  const view = useMemo(() => viewOf(active, compact, roomy), [active, compact, roomy])

  // Geometry lives in world space and is computed once per layout;
  // travelling only changes one transform on the group and one on each node.
  const geometry = useMemo(() => {
    const { flash, laneOf } = lanes(layout)
    const dist = (id: string) => Math.hypot(layout.pos[id].x, layout.pos[id].y)
    const delay: Record<string, number> = {}
    for (const n of nodes) delay[n.id] = Math.round(dist(n.id) * 1.4)
    // When a signal lands on a neuron it ripples: same beat as the lane that feeds it,
    // offset by roughly how long the dash takes to cross (~510px over the travel share of the beat).
    const fire: Record<string, Fire> = {}
    for (const [a, b] of treeEdges) {
      const { dur, lag } = beat(laneOf[b])
      const len = Math.hypot(layout.pos[a].x - layout.pos[b].x, layout.pos[a].y - layout.pos[b].y)
      fire[b] = {
        animationDuration: `${dur}s`,
        animationDelay: `${(dur * TRAVEL * Math.min(1, (len + 9) / 510) - lag).toFixed(2)}s`,
      }
    }
    const tree = treeEdges.map(([a, b]) => line(layout.pos[a], layout.pos[b]))
    return {
      tree,
      treeAll: tree.join(''),
      cross: crossEdges.map(([a, b]) => line(layout.pos[a], layout.pos[b])),
      relay: layout.relayEdges.map(([a, b]) => line(a, b)).join(''),
      // Three depths of point: smaller and dimmer ones sit "behind".
      dots: [0, 1, 2].map((m) => layout.relays.filter((_, i) => i % 3 === m).map((p) => `M${p.x} ${p.y}h0`).join('')),
      // Signals: each branch's own connections in two lanes, in the branch colour,
      // plus a few quiet relay edges. Lanes fire on separate beats.
      flash: flash.map((f, g) => ({ ...f, style: { animationDuration: `${beat(g).dur}s`, animationDelay: `-${beat(g).lag.toFixed(2)}s` } })),
      delay,
      fire,
    }
  }, [layout])

  // Which connections are lit depends only on the route, not on the pointer.
  const { inPath, reached } = useMemo(
    () => ({
      inPath: new Set(view.path),
      // A connection is live when it leads somewhere awake, even through a resting point.
      reached: new Set([...view.awake].flatMap((id) => pathTo(id).map((n) => n.id))),
    }),
    [view],
  )

  // A new destination starts from its own framing again.
  useEffect(() => setUser(HOME), [active, compact])

  // Wheel / trackpad pinch zooms toward the cursor. Stacked pages keep plain scrolling.
  useEffect(() => {
    const el = net.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (compact && !e.ctrlKey) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const mx = e.clientX - r.left - r.width / 2
      const my = e.clientY - r.top - r.height / 2
      setUser((u) => {
        const k = Math.min(3, Math.max(0.35, u.k * Math.exp(-e.deltaY * 0.0015)))
        const f = 1 - k / u.k
        return { dx: u.dx + (mx - u.dx) * f, dy: u.dy + (my - u.dy) * f, k, all: false }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [compact, w, h])

  if (!w || !h) return null

  const leaf = active !== 'root' && !childrenOf(active).length
  // Stacked layout: labels run to one side of the column, so that side is reserved for them.
  const labelSide = layout.side[view.focus[view.focus.length - 1]]
  const reserve = compact && active !== 'root' && (labelSide === 'left' || labelSide === 'right') ? Math.min(140, w * 0.38) : 0
  const frame = reserve ? { ...rect, x: labelSide === 'left' ? reserve : 54, w: rect.w - reserve - 54 } : rect
  const pad = reserve
    ? { x: 22, y: 46 }
    : compact
      ? { x: Math.min(110, w * 0.27), y: 62 }
      : { x: Math.min(150, rect.w * 0.17), y: 84 }
  const base = fit(layout, view.focus, frame, pad, leaf && !compact ? active : undefined)
  const cx = w / 2
  const cy = h / 2
  const cam = {
    x: (base.x - cx) * user.k + cx + user.dx,
    y: (base.y - cy) * user.k + cy + user.dy,
    z: base.z * user.k,
  }
  // One hop beyond the hovered point: the signal spreads outward.
  const near = new Set<string>()
  if (hot)
    for (const [a, b] of treeEdges) {
      if (a === hot) near.add(b)
      if (b === hot) near.add(a)
    }
  const transform = { transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.z})` }

  const limit = (v: number, m: number) => Math.max(-m, Math.min(m, v))
  const onPointerDown = (e: RPointerEvent<HTMLElement>) => {
    if (e.button === 0) drag.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
    const d = drag.current
    if (!d) return
    const mx = e.clientX - d.x
    const my = e.clientY - d.y
    if (!d.moved) {
      if (Math.hypot(mx, my) < 5) return
      // Captured only once it is a drag, so a plain click still reaches the node.
      d.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
      setHot(null)
    }
    d.x = e.clientX
    d.y = e.clientY
    setUser((u) => ({ ...u, dx: limit(u.dx + mx, w), dy: limit(u.dy + my, h), all: false }))
  }
  const onPointerEnd = () => {
    drag.current = null
    setDragging(false)
  }
  // Hover and focus are delegated: one handler here instead of four closures per node.
  const onPointerOver = (e: RPointerEvent<HTMLElement>) => {
    const id = nodeIdOf(e.target)
    if (id && !drag.current?.moved) setHot(id)
  }
  const onPointerOut = (e: RPointerEvent<HTMLElement>) => {
    if (nodeIdOf(e.target) && nodeIdOf(e.relatedTarget) !== nodeIdOf(e.target)) setHot(null)
  }
  // Keyboard focus lights the node's connections; focus restored after a click does not.
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    const id = nodeIdOf(e.target)
    if (id && (e.target as Element).matches(':focus-visible')) setHot(id)
  }
  const seeAll = () => {
    if (user.all) return setUser(HOME)
    const all = fit(layout, allIds, rect, { x: 44, y: 78 })
    const k = all.z / base.z
    setUser({ k, dx: all.x - ((base.x - cx) * k + cx), dy: all.y - ((base.y - cy) * k + cy), all: true })
  }

  // Beside the reading panel, a single line ties the open neuron to its sheet.
  const at = layout.pos[active]
  const lx = at.x * cam.z + cam.x
  const ly = at.y * cam.z + cam.y
  const panelEdge = rect.x + rect.w
  const leader = !compact && active !== 'root' && lx < panelEdge - 8 && ly > 0 && ly < h

  return (
    <nav
      ref={net}
      className={`net${dragging ? ' dragging' : ''}`}
      data-open={active !== 'root' || undefined}
      aria-label="Neural network"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onFocus={onFocus}
      onBlur={() => setHot(null)}
      onDragStart={(e) => e.preventDefault()}
    >
      <svg className="edges" width={w} height={h} aria-hidden="true" focusable="false">
        <g style={transform}>
          <path className="relay-edge" d={geometry.relay} />
          {geometry.dots.map((d, i) => (
            <g key={i} className={`depth-${i}`}>
              <path className="relay-dot" d={d} />
              <path className="relay-dot hole" d={d} />
            </g>
          ))}
          {crossEdges.map(([a, b], i) => {
            const lit = active !== 'root' && (a === active || b === active)
            const warm = hot === a || hot === b
            return (
              <path
                key={a + b}
                d={geometry.cross[i]}
                className={`cross${lit ? ' lit' : ''}${warm ? ' hot' : ''}`}
                data-section={lit ? sectionOf(active) : undefined}
              />
            )
          })}
          {treeEdges.map(([a, b], i) => {
            const on = reached.has(b)
            const travelled = inPath.has(a) && inPath.has(b)
            const spread = near.has(a) || near.has(b)
            const cls = `tree${on ? ' on' : ''}${travelled ? ' path' : ''}${view.dim.has(b) ? ' dim' : ''}${
              hot === a || hot === b ? ' hot' : spread ? ' near' : ''
            }`
            return (
              <g key={b} data-section={sectionOf(b)}>
                <path d={geometry.tree[i]} className={cls} style={{ animationDelay: `${geometry.delay[b]}ms` }} />
                {travelled && <path d={geometry.tree[i]} className="signal" />}
              </g>
            )
          })}
          <g className="flash">
            {geometry.flash.map(({ d, section, style }, g) => (
              <path key={g} d={d} data-section={section} style={style} />
            ))}
          </g>
        </g>
      </svg>

      {/* The same mesh in white, shown only under the cursor. */}
      <svg className="edges glow" width={w} height={h} aria-hidden="true" focusable="false">
        <g style={transform}>
          <path d={geometry.relay} />
          <path d={geometry.treeAll} />
        </g>
      </svg>

      {leader && (
        <svg className="leader" width={w} height={h} aria-hidden="true" focusable="false">
          <path d={`M${lx} ${ly}H${panelEdge}`} />
        </svg>
      )}

      {nodes.map((n) => {
        const p = layout.pos[n.id]
        const x = p.x * cam.z + cam.x
        const y = p.y * cam.z + cam.y
        const awake = view.awake.has(n.id)
        const state =
          n.id === active ? 'active' : inPath.has(n.id) ? 'path' : awake ? 'awake' : reached.has(n.id) ? 'relay' : 'dormant'
        const offstage = x < -8 || y < -8 || x > w + 8 || y > h + 8
        return (
          <NodeLink
            key={n.id}
            id={n.id}
            title={n.title}
            sub={subs.get(n.id)}
            href={routeOf(n.id)}
            kind={n.kind}
            section={sectionOf(n.id)}
            side={layout.side[n.id]}
            state={state}
            dim={view.dim.has(n.id)}
            related={awake && view.related.has(n.id)}
            inert={!awake || offstage}
            current={n.id === active}
            x={x}
            y={y}
            delay={geometry.delay[n.id]}
            fire={geometry.fire[n.id]}
          />
        )
      })}

      <button
        type="button"
        className="see-all"
        style={{ right: w - panelEdge + 16 }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={seeAll}
      >
        {user.all ? 'Back to focus' : 'See every neuron'}
      </button>
    </nav>
  )
})

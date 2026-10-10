import { memo, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { nodes, get, childrenOf, crossEdges, leafCount, pathTo, routeOf, sectionOf } from '../content/index.ts'
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
/** Each flash lane repeats on its own slow beat (seconds); the dash itself crosses in ~a quarter of it. */
const beat = (g: number) => ({ dur: 20 + ((g * 7) % 5) * 2.5, lag: (g * 3.17) % 20 })
const TRAVEL = 0.25
const allIds = nodes.map((n) => n.id)

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
  // Relay edges: every sixth one, in two quiet white lanes.
  const first = lane.push({ edges: [] }, { edges: [] }) - 2
  layout.relayEdges.forEach(([a, b], i) => i % 6 === 0 && lane[first + ((i / 6) % 2)].edges.push(line(a, b)))
  return { flash: lane.map((l) => ({ d: l.edges.join(''), section: l.section })), laneOf }
}

/** The visitor's own camera move, applied on top of the one the route chose. */
const HOME = { dx: 0, dy: 0, k: 1, all: false }

function subLabel(id: string): string | undefined {
  const n = get(id)
  if (n.kind === 'root') return n.eyebrow
  if (!childrenOf(id).length) return undefined
  const c = leafCount(id)
  return n.id === 'projects' || n.kind === 'group' ? `${c} projects` : `${c} entries`
}

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
  const geometry = useMemo(
    () => ({
      tree: treeEdges.map(([a, b]) => line(layout.pos[a], layout.pos[b])),
      cross: crossEdges.map(([a, b]) => line(layout.pos[a], layout.pos[b])),
      relay: layout.relayEdges.map(([a, b]) => line(a, b)).join(''),
      // Three depths of point: smaller and dimmer ones sit "behind".
      dots: [0, 1, 2].map((m) => layout.relays.filter((_, i) => i % 3 === m).map((p) => `M${p.x} ${p.y}h0`).join('')),
      // Signals: each branch's own connections in two lanes, in the branch colour,
      // plus a few quiet relay edges. Lanes fire on separate beats.
      ...lanes(layout),
    }),
    [layout],
  )

  // When a signal lands on a neuron it ripples: same beat as the lane that feeds it,
  // offset by roughly how long the dash takes to cross (~510px over the travel share of the beat).
  const ripple = useMemo(() => {
    const out: Record<string, { animationDuration: string; animationDelay: string }> = {}
    treeEdges.forEach(([a, b]) => {
      const { dur, lag } = beat(geometry.laneOf[b])
      const len = Math.hypot(layout.pos[a].x - layout.pos[b].x, layout.pos[a].y - layout.pos[b].y)
      out[b] = { animationDuration: `${dur}s`, animationDelay: `${(dur * TRAVEL * Math.min(1, (len + 9) / 510) - lag).toFixed(2)}s` }
    })
    return out
  }, [layout, geometry])

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
  const inPath = new Set(view.path)
  // A connection is live when it leads somewhere awake, even through a resting point.
  const reached = new Set([...view.awake].flatMap((id) => pathTo(id).map((n) => n.id)))
  // One hop beyond the hovered point: the signal spreads outward.
  const near = new Set<string>()
  if (hot)
    for (const [a, b] of treeEdges) {
      if (a === hot) near.add(b)
      if (b === hot) near.add(a)
    }
  const dist = (id: string) => Math.hypot(layout.pos[id].x, layout.pos[id].y)
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
                <path d={geometry.tree[i]} className={cls} style={{ animationDelay: `${Math.round(dist(b) * 1.4)}ms` }} />
                {travelled && <path d={geometry.tree[i]} className="signal" />}
              </g>
            )
          })}
          <g className="flash">
            {geometry.flash.map(({ d, section }, g) => (
              <path
                key={g}
                d={d}
                data-section={section}
                style={{ animationDuration: `${beat(g).dur}s`, animationDelay: `-${beat(g).lag.toFixed(2)}s` }}
              />
            ))}
          </g>
        </g>
      </svg>

      {/* The same mesh in white, shown only under the cursor. */}
      <svg className="edges glow" width={w} height={h} aria-hidden="true" focusable="false">
        <g style={transform}>
          <path d={geometry.relay} />
          <path d={geometry.tree.join('')} />
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
        const sub = subLabel(n.id)
        const offstage = x < -8 || y < -8 || x > w + 8 || y > h + 8
        return (
          <a
            key={n.id}
            id={`node-${n.id}`}
            href={routeOf(n.id)}
            className="node"
            data-kind={n.kind}
            data-section={sectionOf(n.id)}
            data-side={layout.side[n.id]}
            data-state={state}
            data-dim={view.dim.has(n.id) || undefined}
            data-related={(awake && view.related.has(n.id)) || undefined}
            // Dormant points are decoration until their branch opens.
            inert={!awake || offstage}
            aria-current={n.id === active ? 'page' : undefined}
            style={{
              transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`,
              ['--bd' as string]: `${Math.round(dist(n.id) * 1.4)}ms`,
            }}
            onPointerEnter={() => !drag.current?.moved && setHot(n.id)}
            onPointerLeave={() => setHot(null)}
            // Keyboard focus lights the node's connections; focus restored after a click does not.
            onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHot(n.id)}
            onBlur={() => setHot(null)}
          >
            <span className={`core${ripple[n.id] ? ' fires' : ''}`} style={ripple[n.id]} aria-hidden="true" />
            <span className="label">
              <span className="name">{n.title}</span>
              {sub && <span className="sub">{sub}</span>}
            </span>
          </a>
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

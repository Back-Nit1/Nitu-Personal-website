import { memo, useMemo, useState } from 'react'
import { nodes, get, childrenOf, crossEdges, leafCount, pathTo, routeOf, sectionOf } from '../content/index.ts'
import { buildLayout, fit, viewOf, type Pt, type Rect } from './layout.ts'

interface Props {
  active: string
  portrait: boolean
  /** Stage size in pixels. */
  w: number
  h: number
  /** The part of the stage the camera may use (the rest sits under the reading panel). */
  rect: Rect
}

/** A gently bowed connection; `k` sets how far and which way it bends. */
function curve(a: Pt, b: Pt, k: number): string {
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * k
  const my = (a.y + b.y) / 2 + (b.x - a.x) * k
  return `M${a.x} ${a.y}Q${Math.round(mx)} ${Math.round(my)} ${b.x} ${b.y}`
}

const treeEdges = nodes.filter((n) => n.parent).map((n) => [n.parent!, n.id] as const)

function subLabel(id: string): string | undefined {
  const n = get(id)
  if (n.kind === 'root') return n.eyebrow
  if (!childrenOf(id).length) return undefined
  const c = leafCount(id)
  return n.id === 'projects' || n.kind === 'group' ? `${c} projects` : `${c} entries`
}

export const Network = memo(function Network({ active, portrait, w, h, rect }: Props) {
  const [hot, setHot] = useState<string | null>(null)
  const layout = buildLayout(portrait)
  const view = useMemo(() => viewOf(active, portrait), [active, portrait])

  // Geometry lives in world space and is computed once per layout;
  // travelling only changes one transform on the group and one on each node.
  const geometry = useMemo(
    () => ({
      tree: treeEdges.map(([a, b], i) => curve(layout.pos[a], layout.pos[b], i % 2 ? 0.1 : -0.1)),
      cross: crossEdges.map(([a, b]) => curve(layout.pos[a], layout.pos[b], 0.2)),
      relay: layout.relayEdges.map(([a, b], i) => curve(a, b, i % 2 ? 0.14 : -0.14)).join(''),
      dots: layout.relays.map((p) => `M${p.x} ${p.y}h0`).join(''),
    }),
    [layout],
  )

  if (!w || !h) return null

  const leaf = active !== 'root' && !childrenOf(active).length
  const pad = portrait ? { x: 64, y: 58 } : { x: Math.min(150, rect.w * 0.17), y: 64 }
  const cam = fit(layout, view.focus, rect, pad, leaf ? active : undefined)
  const inPath = new Set(view.path)
  // A connection is live when it leads somewhere awake, even through a resting point.
  const reached = new Set([...view.awake].flatMap((id) => pathTo(id).map((n) => n.id)))

  return (
    <nav className="net" aria-label="Neural network">
      <svg className="edges" width={w} height={h} aria-hidden="true" focusable="false">
        <g style={{ transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.z})` }}>
          <path className="relay-edge" d={geometry.relay} />
          <path className="relay-dot" d={geometry.dots} />
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
            const cls = `tree${on ? ' on' : ''}${travelled ? ' path' : ''}${view.dim.has(b) ? ' dim' : ''}${
              hot === a || hot === b ? ' hot' : ''
            }`
            return (
              <g key={b} data-section={sectionOf(b)}>
                <path d={geometry.tree[i]} className={cls} />
                {travelled && <path d={geometry.tree[i]} className="signal" />}
              </g>
            )
          })}
        </g>
      </svg>

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
            data-related={view.related.has(n.id) || undefined}
            // Dormant points are decoration until their branch opens.
            inert={!awake || offstage}
            aria-current={n.id === active ? 'page' : undefined}
            style={{ transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` }}
            onPointerEnter={() => setHot(n.id)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(n.id)}
            onBlur={() => setHot(null)}
          >
            <span className="core" aria-hidden="true" />
            <span className="label">
              <span className="name">{n.title}</span>
              {sub && <span className="sub">{sub}</span>}
            </span>
          </a>
        )
      })}
    </nav>
  )
})

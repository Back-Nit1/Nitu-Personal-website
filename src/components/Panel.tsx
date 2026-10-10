import type { ReactNode, RefObject } from 'react'
import { childrenOf, contactLinks, recovering, get, leafCount, pathTo, relatedOf, routeOf, sectionOf, type AtlasNode } from '../content/index.ts'
import type { Route } from '../app/hooks.ts'
import { Flow, Scene } from './Visuals.tsx'

interface Props {
  route: Route
  titleRef: RefObject<HTMLHeadingElement | null>
  onBack: () => void
}

const kindLabel: Record<AtlasNode['kind'], string> = {
  root: 'Whole network',
  section: 'Branch',
  group: 'Project group',
  project: 'Project',
  entry: 'Entry',
}

/** Where a connected node lives, so the link says why it's worth following. */
const whereabouts = (n: AtlasNode): string =>
  n.kind === 'section' ? kindLabel.section : get(n.parent!).title

function NodeLinks({ items, showLead }: { items: AtlasNode[]; showLead?: boolean }) {
  return (
    <ul className="rows">
      {items.map((n) => (
        <li key={n.id}>
          <a href={routeOf(n.id)} data-section={sectionOf(n.id)}>
            <span className="row-title">{n.title}</span>
            <span className="row-meta">
              {showLead ? (childrenOf(n.id).length ? `${leafCount(n.id)} projects` : n.eyebrow) : whereabouts(n)}
            </span>
            {showLead && n.lead && <span className="row-lead">{n.lead}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="fact">
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Reading({ node }: { node: AtlasNode }) {
  const kids = childrenOf(node.id)
  const related = relatedOf(node.id).map(get)
  const chips = node.stack ?? node.tags
  return (
    <>
      {node.lead && <p className="lead">{node.lead}</p>}

      {node.visual ? <Scene id={node.visual} /> : node.flow && <Flow steps={node.flow} />}

      {node.body?.map((p) => <p key={p}>{p}</p>)}

      {(node.contribution || node.outcome || node.recognition) && (
        <dl className="facts">
          {node.contribution && <Fact term="My part">{node.contribution}</Fact>}
          {node.outcome && (
            <Fact term="Outcome">
              <strong>{node.outcome}</strong>
              {node.context && <span className="scope">{node.context}</span>}
            </Fact>
          )}
          {node.recognition && <Fact term="Recognition">{node.recognition}</Fact>}
        </dl>
      )}
      {!node.outcome && node.context && <p className="scope solo">{node.context}</p>}

      {chips && (
        <ul className="chips" aria-label={node.stack ? 'Stack' : 'Themes'}>
          {chips.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}

      {node.details && (
        <details className="more">
          <summary>Technical detail and evidence</summary>
          <ul>
            {node.details.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </details>
      )}

      {node.links && (
        <p className="actions">
          {node.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
        </p>
      )}

      {node.id === 'connect' &&
        (contactLinks.length ? (
          <>
            <p className="actions">
              {contactLinks.map((l) => <a key={l.url} href={l.url} rel="noreferrer">{l.label} ↗</a>)}
            </p>
            <p className="scope">Main GitHub: {recovering.handle} | {recovering.note}</p>
          </>
        ) : (
          <p className="scope solo">Direct contact links are on their way. Until then, the work speaks first.</p>
        ))}

      {kids.length > 0 && (
        <section aria-label={`In ${node.title}`}>
          <h3>In this branch</h3>
          <NodeLinks items={kids} showLead />
        </section>
      )}

      {related.length > 0 && (
        <section aria-label="Connected to">
          <h3>Connected to</h3>
          <NodeLinks items={related} />
        </section>
      )}
    </>
  )
}

/** Every entry as a plain nested list: the atlas without the graph. */
function Outline({ id }: { id: string }) {
  const kids = childrenOf(id)
  if (!kids.length) return null
  return (
    <ul className="outline">
      {kids.map((n) => (
        <li key={n.id}>
          <a href={routeOf(n.id)}>{n.title}</a>
          {!childrenOf(n.id).length && n.lead && <span>: {n.lead}</span>}
          <Outline id={n.id} />
        </li>
      ))}
    </ul>
  )
}

export function Panel({ route, titleRef, onBack }: Props) {
  const node = get(route.id)
  const open = route.view !== 'node' || route.id !== 'root'
  if (!open) return null

  const [eyebrow, title, body]: [string, string, ReactNode] =
    route.view === 'index'
      ? ['Index', 'Everything in the atlas', <><p className="lead">The same places as the network, as a plain list.</p><Outline id="root" /></>]
      : route.view === 'missing'
        ? ['Off the map', 'There’s nothing at this address', <><p className="lead">The link may be old or mistyped. Every entry is still reachable from the whole network or the index.</p><p className="actions"><a href="#/">Whole network</a><a href="#/index">Index</a></p></>]
        : [node.eyebrow ?? kindLabel[node.kind], node.title, <Reading node={node} />]

  const trail = route.view === 'node' ? pathTo(node.id).slice(1, -1) : []

  return (
    <aside className="panel" aria-label="Reading view" data-section={route.view === 'node' ? sectionOf(node.id) : undefined}>
      <div className="panel-bar">
        <button type="button" onClick={onBack}>← Back</button>
        <a href="#/" aria-label="Close and return to the whole network">Close ✕</a>
      </div>
      {/* Keyed so each destination fades in fresh and starts at the top. */}
      <article key={route.view + route.id} className="reading">
        <p className="eyebrow">
          {trail.map((n) => <span key={n.id}>{n.title} / </span>)}
          {eyebrow}
        </p>
        <h2 ref={titleRef} tabIndex={-1}>{title}</h2>
        {body}
      </article>
    </aside>
  )
}

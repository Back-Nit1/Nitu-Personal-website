import { pathTo, routeOf } from '../content/index.ts'
import type { Route } from '../app/hooks.ts'

export function Header() {
  return (
    <header className="head">
      <a className="identity" href="#/" aria-label="Nityanth Maramreddy — return to the whole network">
        <span className="mono-mark" aria-hidden="true">nm<i>.</i></span>
        <h1>Nityanth Maramreddy</h1>
      </a>
    </header>
  )
}

export function Footer({ route }: { route: Route }) {
  const trail = route.view === 'node' ? pathTo(route.id) : pathTo('root')
  const extra = route.view === 'index' ? 'Index' : route.view === 'missing' ? 'Off the map' : null
  const atRoot = trail.length === 1 && !extra
  return (
    <footer className="foot">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          {trail.map((n, i) => {
            const here = i === trail.length - 1 && !extra
            const label = n.kind === 'root' ? 'Whole network' : n.title
            return (
              <li key={n.id}>
                {here ? <span aria-current="page">{label}</span> : <a href={routeOf(n.id)}>{label}</a>}
              </li>
            )
          })}
          {extra && <li><span aria-current="page">{extra}</span></li>}
        </ol>
        {atRoot && <span className="hint">Drag to look around · select a neuron to open it</span>}
      </nav>
      <a className="index-link" href="#/index">Index</a>
    </footer>
  )
}

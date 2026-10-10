import { childrenOf, pathTo, routeOf } from '../content/index.ts'
import type { Route } from '../app/hooks.ts'

export function Header({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <header className="head">
      <a className="identity" href="#/" aria-label="Nityanth Maramreddy — return to the whole network">
        <span className="mono-mark" aria-hidden="true">nm<i>.</i></span>
        <span className="identity-text">
          <h1>Nityanth Maramreddy</h1>
          <span className="tagline">Computer Science × Neuroscience · Rutgers</span>
        </span>
      </a>
      <p className="quiet">A curious mind, mapped out.</p>
      <button type="button" className="theme" onClick={onToggleTheme} aria-label={`Switch to ${next} appearance`}>
        <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span> {theme}
      </button>
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
        {atRoot && <span className="hint">Select a node to explore</span>}
      </nav>
      <nav className="direct" aria-label="Sections">
        <ul>
          {childrenOf('root').map((s) => (
            <li key={s.id}>
              <a href={routeOf(s.id)} data-section={s.id} aria-current={trail[1]?.id === s.id ? 'true' : undefined}>
                {s.id === 'story' ? 'Story' : s.title}
              </a>
            </li>
          ))}
          <li><a href="#/index">Index</a></li>
        </ul>
      </nav>
    </footer>
  )
}

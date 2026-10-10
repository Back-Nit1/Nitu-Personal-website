import { useCallback, useEffect, useRef } from 'react'
import { get, pathTo, routeOf } from '../content/index.ts'
import { Network } from '../network/Network.tsx'
import { Header, Footer } from '../components/Chrome.tsx'
import { Panel } from '../components/Panel.tsx'
import { useMedia, useRoute, useSize } from './hooks.ts'

export function App() {
  const route = useRoute()
  // Wide: the reading panel sits beside the graph. Otherwise it follows in document flow.
  const wide = useMedia('(min-width: 900px)')
  const portrait = useMedia('(max-width: 719px)')

  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { w, h } = useSize(stageRef)

  const { id, view, depth } = route
  const open = view !== 'node' || id !== 'root'
  const panelW = Math.round(Math.min(540, Math.max(380, w * 0.36)))
  const rect = { x: 0, y: 0, w: wide && open ? w - panelW - 12 : w, h }

  const parent = view === 'node' ? get(id).parent : 'root'

  // Back retraces the visitor's own steps; with none behind them, it climbs one level.
  const onBack = useCallback(() => {
    if (depth > 0) history.back()
    else location.hash = routeOf(parent ?? 'root')
  }, [depth, parent])

  // Escape climbs one level and never traps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !open || e.defaultPrevented) return
      location.hash = routeOf(parent ?? 'root')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open, parent])

  // Focus follows the visitor: into the reading view on arrival, back to the node on return.
  const previous = useRef<string | null>(null)
  useEffect(() => {
    const key = view + id
    const from = previous.current
    previous.current = key
    if (from === null || from === key) return
    if (open) {
      titleRef.current?.focus({ preventScroll: true })
      // In the stacked layout, bring the graph back into view so the journey is visible.
      if (!wide && scrollY > 80)
        scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    } else {
      const section = from.startsWith('node') ? pathTo(from.slice(4))[1]?.id : undefined
      document.getElementById(`node-${section ?? 'root'}`)?.focus({ preventScroll: true })
    }
  }, [view, id, open, wide])

  useEffect(() => {
    const name = view === 'index' ? 'Index' : view === 'missing' ? 'Not found' : id === 'root' ? null : get(id).title
    document.title = (name ? `${name} · ` : '') + 'Nitu Maramreddy | Software, ML & Connected Ideas'
  }, [view, id])

  const announce =
    view === 'index' ? 'Index' : view === 'missing' ? 'Page not found' : id === 'root' ? 'Whole network' : get(id).title

  return (
    <div className="app" data-open={open || undefined} style={{ '--panel-w': `${panelW}px` } as React.CSSProperties}>
      <a className="skip" href={open ? '#reading' : '#sections'}>Skip the network</a>
      <Header />
      <main className="main">
        <div className="stage" ref={stageRef}>
          <Network active={id} compact={!wide} portrait={portrait} w={w} h={h} rect={rect} />
        </div>
        <div id="reading">
          <Panel route={route} titleRef={titleRef} onBack={onBack} />
        </div>
      </main>
      <div id="sections">
        <Footer route={route} />
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  )
}

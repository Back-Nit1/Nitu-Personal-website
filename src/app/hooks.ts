import { useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from 'react'
import { resolve, routeOf } from '../content/index.ts'

// --- Hash routing ---

/** `index` and `missing` are reading views that leave the graph at the whole network. */
export type Route = { id: string; view: 'node' | 'index' | 'missing' }

function parse(hash: string): Route {
  if (/^#\/index\/?$/.test(hash)) return { id: 'root', view: 'index' }
  const id = resolve(hash)
  return id ? { id, view: 'node' } : { id: 'root', view: 'missing' }
}

const depth = (): number => history.state?.d ?? 0

/**
 * Current route plus how many in-site steps lie behind it. Depth rides on
 * history.state, so it survives refresh and stays right across Back and Forward.
 */
export function useRoute(): Route & { depth: number } {
  const [hash, setHash] = useState(location.hash)

  useEffect(() => {
    if (history.state?.d == null) history.replaceState({ d: 0 }, '')
    let last = depth()
    const onChange = () => {
      // A fresh navigation arrives with empty state; Back and Forward bring theirs along.
      if (history.state?.d == null) history.replaceState({ d: last + 1 }, '')
      last = depth()
      setHash(location.hash)
    }
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])

  const route = parse(hash)

  // One canonical URL per entry: `#/nomos` becomes `#/projects/autonomy/nomos`.
  useEffect(() => {
    if (route.view === 'node' && location.hash && location.hash !== routeOf(route.id))
      history.replaceState(history.state, '', routeOf(route.id))
  }, [route.view, route.id])

  return { ...route, depth: depth() }
}

// --- Measurement ---

export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches)
}

/** Element size, kept current through resizes and orientation changes. */
export function useSize(ref: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 })
  // Measured before first paint, so the graph is there from the first frame.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      setSize((s) => (s.w === el.clientWidth && s.h === el.clientHeight ? s : { w: el.clientWidth, h: el.clientHeight }))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

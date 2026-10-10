import type { AtlasNode, SectionId } from './types.ts'
import { structure } from './structure.ts'
import { projects } from './projects.ts'
import { entries } from './entries.ts'

export type { AtlasNode, SectionId, VisualId, Link } from './types.ts'
export { contactLinks, recovering } from './site.ts'

export const nodes: AtlasNode[] = [...structure, ...entries, ...projects]

export const byId = new Map(nodes.map((n) => [n.id, n]))

export const get = (id: string): AtlasNode => {
  const n = byId.get(id)
  if (!n) throw new Error(`Unknown node "${id}"`)
  return n
}

const kids = new Map<string, AtlasNode[]>()
for (const n of nodes) {
  if (!n.parent) continue
  kids.set(n.parent, [...(kids.get(n.parent) ?? []), n])
}
export const childrenOf = (id: string): AtlasNode[] => kids.get(id) ?? []

/** Root first, the node itself last. */
export function pathTo(id: string): AtlasNode[] {
  const out: AtlasNode[] = []
  for (let n: AtlasNode | undefined = get(id); n; n = n.parent ? get(n.parent) : undefined) out.unshift(n)
  return out
}

/** The top-level branch a node lives under; drives its accent. */
export const sectionOf = (id: string): SectionId | undefined => pathTo(id)[1]?.id as SectionId | undefined

/** Number of projects or entries beneath a node. */
export const leafCount = (id: string): number =>
  childrenOf(id).reduce((sum, c) => sum + (childrenOf(c.id).length ? leafCount(c.id) : 1), 0)

// --- Routes: one canonical hash route per node ---

export const routeOf = (id: string): string =>
  '#/' +
  pathTo(id)
    .slice(1)
    .map((n) => n.slug ?? n.id)
    .join('/')

const byRoute = new Map(nodes.map((n) => [routeOf(n.id), n.id]))
const bySlug = new Map(nodes.map((n) => [n.slug ?? n.id, n.id]))

/**
 * Hash → node ID. A stale or shortened path still resolves through its last
 * segment, so `#/nomos` finds Nomos. Returns undefined for unknown routes.
 */
export function resolve(hash: string): string | undefined {
  const clean = '#/' + hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  return byRoute.get(clean) ?? bySlug.get(clean.split('/').pop() ?? '')
}

// --- Cross-connections: undirected, deduplicated ---

const linked = new Map<string, Set<string>>()
for (const n of nodes) {
  for (const r of n.related ?? []) {
    if (!linked.has(n.id)) linked.set(n.id, new Set())
    if (!linked.has(r)) linked.set(r, new Set())
    linked.get(n.id)!.add(r)
    linked.get(r)!.add(n.id)
  }
}

/** A node's own connections first, then the ones that point back at it. */
export const relatedOf = (id: string): string[] => [...(linked.get(id) ?? [])]

export const crossEdges: [string, string][] = [...linked].flatMap(([a, set]) =>
  [...set].filter((b) => a < b && get(a).parent !== b && get(b).parent !== a).map((b) => [a, b] as [string, string]),
)

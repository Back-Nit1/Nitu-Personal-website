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

// The content is static, so every derived lookup is computed once at load.
// Render code then reads from these tables instead of walking the tree.

const kids = new Map<string, AtlasNode[]>()
for (const n of nodes) {
  if (!n.parent) continue
  const list = kids.get(n.parent)
  if (list) list.push(n)
  else kids.set(n.parent, [n])
}
const none: AtlasNode[] = []
export const childrenOf = (id: string): AtlasNode[] => kids.get(id) ?? none

const paths = new Map<string, AtlasNode[]>()
function buildPath(n: AtlasNode): AtlasNode[] {
  let p = paths.get(n.id)
  if (!p) {
    p = n.parent ? [...buildPath(get(n.parent)), n] : [n]
    paths.set(n.id, p)
  }
  return p
}
for (const n of nodes) buildPath(n)

/** Root first, the node itself last. Shared and cached: treat as read only. */
export const pathTo = (id: string): AtlasNode[] => paths.get(id) ?? buildPath(get(id))

/** The top-level branch a node lives under; drives its accent. */
export const sectionOf = (id: string): SectionId | undefined => pathTo(id)[1]?.id as SectionId | undefined

const leaves = new Map<string, number>()
function countLeaves(id: string): number {
  let c = leaves.get(id)
  if (c === undefined) {
    c = childrenOf(id).reduce((sum, k) => sum + (childrenOf(k.id).length ? countLeaves(k.id) : 1), 0)
    leaves.set(id, c)
  }
  return c
}
/** Number of projects or entries beneath a node. */
export const leafCount = countLeaves

// --- Routes: one canonical hash route per node ---

const routes = new Map(nodes.map((n) => [n.id, '#/' + pathTo(n.id).slice(1).map((p) => p.slug ?? p.id).join('/')]))
export const routeOf = (id: string): string => routes.get(id) ?? '#/'

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

const relatedIds = new Map([...linked].map(([id, set]) => [id, [...set]]))
const noIds: string[] = []
/** A node's own connections first, then the ones that point back at it. */
export const relatedOf = (id: string): string[] => relatedIds.get(id) ?? noIds

export const crossEdges: [string, string][] = [...linked].flatMap(([a, set]) =>
  [...set].filter((b) => a < b && get(a).parent !== b && get(b).parent !== a).map((b) => [a, b] as [string, string]),
)

/** Closest entries to a mistyped address: any whose id, slug, or title shares a word with it. */
export function suggest(hash: string, limit = 4): AtlasNode[] {
  const words = hash.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2)
  if (!words.length) return []
  return nodes
    .filter((n) => n.kind !== 'root')
    .map((n) => {
      const hay = `${n.id} ${n.slug ?? ''} ${n.title}`.toLowerCase()
      return { n, score: words.filter((w) => hay.includes(w) || hay.includes(w.slice(0, 4)) || w.includes(n.id)).length }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.n)
}

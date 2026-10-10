// Invariants for the content graph and layout. Run: npm run check
import assert from 'node:assert/strict'
import { nodes, byId, childrenOf, relatedOf, routeOf, resolve, pathTo } from '../src/content/index.ts'
import { buildLayout, viewOf } from '../src/network/layout.ts'

const count = (kind: string) => nodes.filter((n) => n.kind === kind).length
assert.equal(count('section'), 6, 'six main branches')
assert.equal(count('group'), 5, 'five project groups')
assert.equal(count('project'), 17, '17 projects')
assert.equal(count('entry'), 18, '18 story/experience/research/personal entries')
assert.equal(new Set(nodes.map((n) => n.id)).size, nodes.length, 'IDs are unique')
assert.equal(new Set(nodes.map((n) => n.slug ?? n.id)).size, nodes.length, 'slugs are unique')

for (const n of nodes) {
  if (n.parent) assert.ok(byId.has(n.parent), `${n.id}: parent "${n.parent}" exists`)
  for (const r of n.related ?? []) assert.ok(byId.has(r), `${n.id}: related "${r}" exists`)
  assert.equal(resolve(routeOf(n.id)), n.id, `${n.id}: route round-trips`)
  assert.equal(pathTo(n.id)[0].id, 'root', `${n.id}: reaches root`)
  if (n.kind === 'project' || n.kind === 'entry') {
    assert.ok(n.eyebrow && n.lead && n.body?.length, `${n.id}: has status, lead, and body`)
    assert.equal(childrenOf(n.id).length, 0, `${n.id}: is a leaf`)
  }
  for (const l of n.links ?? []) assert.match(l.url, /^(https?:|mailto:|\.\/)/, `${n.id}: link is real`)
}

// Routes named in the brief.
for (const [hash, id] of [
  ['#/', 'root'],
  ['', 'root'],
  ['#/story', 'story'],
  ['#/experience/neuropath', 'neuropath'],
  ['#/projects/autonomy/nomos', 'nomos'],
  ['#/research/reliability', 'reliability'],
  ['#/off-duty/books', 'books'],
  ['#/connect', 'connect'],
  ['#/nomos', 'nomos'],
  ['#/nope', undefined],
] as const)
  assert.equal(resolve(hash), id, `resolve(${hash})`)

// Cross-connections the brief requires.
const required: [string, string][] = [
  ['nomos', 'naigos'], ['naigos', 'rl'], ['nomos', 'rl'],
  ['palura', 'origin'], ['origin', 'games'], ['palura', 'games'],
  ['seqra', 'neuroscience'], ['neuroscience', 'health'],
  ['meridian', 'penn'], ['penn', 'neuropath'], ['meridian', 'neuropath'],
  ['cerno', 'praedos'], ['praedos', 'reliability'], ['cerno', 'reliability'],
  ['themis', 'sentinel'], ['sentinel', 'covenant'], ['themis', 'covenant'],
  ['kairos', 'leadership'], ['leadership', 'outreach'],
  ['books', 'names'], ['names', 'stories'], ['books', 'stories'],
]
for (const [a, b] of required) {
  assert.ok(relatedOf(a).includes(b), `${a} ↔ ${b}`)
  assert.ok(relatedOf(b).includes(a), `${b} ↔ ${a}`)
}

// Layout: deterministic, complete, and no two labelled siblings on top of each other.
for (const [portrait, compact] of [[false, false], [false, true], [true, true]]) {
  const a = buildLayout(compact, portrait)
  assert.deepEqual(a, buildLayout(compact, portrait), 'layout is deterministic')
  for (const n of nodes) assert.ok(a.pos[n.id], `${n.id}: has a position`)
  for (const n of nodes) {
    const sibs = childrenOf(n.id)
    for (const s of sibs)
      for (const t of sibs)
        if (s.id < t.id)
          assert.ok(
            Math.hypot(a.pos[s.id].x - a.pos[t.id].x, a.pos[s.id].y - a.pos[t.id].y) > 40,
            `${s.id} and ${t.id} overlap (${portrait ? 'portrait' : 'landscape'})`,
          )
    // Every view frames the node it is about.
    const v = viewOf(n.id, compact)
    assert.ok(v.awake.has(n.id) && v.focus.length > 0, `${n.id}: view is usable`)
  }
}

console.log(`ok — ${nodes.length} nodes, ${required.length} required connections, 3 layouts`)

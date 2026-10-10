// Writes one readable Markdown page per project into docs/projects/. Run: npm run docs
// The site content stays the single source of truth; these files are generated from it.
import { mkdirSync, writeFileSync } from 'node:fs'
import { nodes, get, pathTo, relatedOf } from '../src/content/index.ts'

const dir = new URL('../docs/projects/', import.meta.url)
mkdirSync(dir, { recursive: true })

const projects = nodes.filter((n) => n.kind === 'project')
for (const n of projects) {
  const out: string[] = [`# ${n.title}`, '']
  if (n.eyebrow) out.push(`*${n.eyebrow}* · ${pathTo(n.id).slice(1, -1).map((p) => p.title).join(' / ')}`, '')
  if (n.lead) out.push(`> ${n.lead}`, '')
  for (const p of n.body ?? []) out.push(p, '')
  if (n.contribution) out.push(`**My part.** ${n.contribution}`, '')
  if (n.outcome) out.push(`**Outcome.** ${n.outcome}${n.context ? ` ${n.context}` : ''}`, '')
  if (n.recognition) out.push(`**Recognition.** ${n.recognition}`, '')
  if (n.stack?.length) out.push(`**Stack.** ${n.stack.join(', ')}`, '')
  if (n.flow?.length) out.push(`**Workflow.** ${n.flow.join(' → ')}`, '')
  if (n.details?.length) out.push('## Technical detail and evidence', '', ...n.details.map((d) => `- ${d}`), '')
  if (n.links?.length) out.push('## Links', '', ...n.links.map((l) => `- [${l.label}](${l.url})`), '')
  const rel = relatedOf(n.id).map((id) => get(id).title)
  if (rel.length) out.push(`**Connected to.** ${rel.join(', ')}`, '')
  writeFileSync(new URL(`${n.id}.md`, dir), out.join('\n').trimEnd() + '\n')
}

const index = ['# Projects', '', ...projects.map((n) => `- [${n.title}](${n.id}.md): ${n.lead ?? ''}`), '']
writeFileSync(new URL('README.md', dir), index.join('\n'))
console.log(`wrote ${projects.length} project pages`)

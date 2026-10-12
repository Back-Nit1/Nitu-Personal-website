export type NodeKind = 'root' | 'section' | 'group' | 'project' | 'entry'

export type SectionId = 'story' | 'experience' | 'projects' | 'research' | 'offduty' | 'connect'

export type VisualId = 'nomos' | 'naigos' | 'palura' | 'seqra' | 'kairos' | 'gate' | 'covenant' | 'meridian'

export interface Link {
  label: string
  url: string
}

/**
 * One record per place in the atlas. Each piece of content exists once;
 * `related` references other records by ID.
 */
export interface AtlasNode {
  id: string
  /** URL segment. Defaults to `id`. */
  slug?: string
  kind: NodeKind
  title: string
  parent?: string
  related?: string[]
  /** Shown at the root view on wide screens as a fast path. */
  featured?: boolean

  /** Small mono line above the title: project status or entry context. */
  eyebrow?: string
  /** The one-line problem statement or lead. */
  lead?: string
  /** Main paragraphs. */
  body?: string[]
  contribution?: string
  stack?: string[]
  tags?: string[]
  outcome?: string
  /** Scope of the outcome: what was evaluated, where, and what it does not claim. */
  context?: string
  recognition?: string
  /** Progressive disclosure: technical detail and evidence. */
  details?: string[]
  /** Stages of the real workflow, drawn as a labelled diagram. */
  flow?: string[]
  /** A bespoke schematic scene. */
  visual?: VisualId
  /** Real screenshots, paths relative to `public/`. Say what data they show in the caption. */
  screens?: { src: string; alt: string; caption: string }[]
  /** Only real, working URLs. */
  links?: Link[]

  /** Internal provenance for future editing. Never rendered. */
  note?: string
}

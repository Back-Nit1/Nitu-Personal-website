# The Neural Atlas — Nitu's portfolio

## Code Exploration — MANDATORY (codemunch)

<CRITICAL>
You MUST use codemunch for ALL code exploration. This is NON-NEGOTIABLE. Do NOT ignore this rule.
Reading full files when a codemunch command exists for the task is a violation of your instructions.
</CRITICAL>

### Rules (enforced, no exceptions)

1. **NEVER read a full source file to understand what a function/class does.** Use `/codemunch:fetch <name>` instead. It reads ~35 tokens instead of ~8,000.
2. **NEVER use Grep or Glob to find functions, classes, or types.** Use `/codemunch:search <query>` instead. Supports filters: `kind:class`, `file:auth`, `in:ClassName`, `sig:ReturnType`.
3. **NEVER read multiple files to understand project structure.** Use `/codemunch:explore [path]` instead.
4. **NEVER use Grep to find symbol usages.** Use `/codemunch:refs <name>` instead.
5. **The ONLY exception**: Use Read when you need to Edit a file, since Edit requires file content in context.

### Decision tree

- Need to find a symbol? → `/codemunch:search`
- Need to read a symbol's code? → `/codemunch:fetch`
- Need to understand structure? → `/codemunch:explore`
- Need to find references? → `/codemunch:refs`
- Need to edit a file? → Read first, then Edit (this is the ONLY valid use of Read for source files)

The index auto-updates — no manual indexing needed.

## Project

Static React + TypeScript + Vite site. No backend, no router library, no motion library.

- `npm run dev` — local server
- `npm run build` — typecheck + production build to `dist/`
- `npm run check` — content/graph/layout invariants (plain Node, no test framework)

### Where things live

- `src/content/` — the single source of truth. Every node (section, group, project, entry) exists once; `related` holds IDs. `note` fields are internal provenance and are never rendered.
- `src/network/` — deterministic layout, camera fit, and the graph view (SVG edges + HTML link nodes).
- `src/app/` — shell, hash routing, appearance.
- `src/components/` — header, footer, reading panel, project schematics.

### Rules for content edits

- Keep statuses and evaluation context honest: simulation results stay simulation results, prototypes stay prototypes.
- Contact links live in `src/content/site.ts`. Leave a value `undefined` and its action disappears; never ship a placeholder link.
- Run `npm run check` after touching content IDs or `related` lists.

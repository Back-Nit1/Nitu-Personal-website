# The Neural Atlas

Personal site for Nityanth “Nitu” Maramreddy. The homepage is an explorable network: follow connections from **nitu** into projects, experience, research, story, and interests.

Static React + TypeScript + Vite. No backend, no router library, no animation library.

## Run it

```bash
npm install
npm run dev      # local server
npm run build    # typecheck, then production build into dist/
npm run preview  # serve the production build
npm run check    # content, route, and layout invariants
```

`dist/` is plain static files with relative paths, so it deploys to any static host or subpath as-is.

## Before launch

Open `src/content/site.ts` and fill in the contact links you want shown. Anything left `undefined` is not rendered, so there are no dead buttons.

- **GitHub**: `https://github.com/N1tu-Mar` returned 404 when this was built. Confirm the handle first.
- **Email, LinkedIn, résumé**: not supplied yet.
- **Social preview**: once the site has a URL, add `og:url` and make `og:image` absolute in `index.html`. Some crawlers also want a PNG rather than `public/og.svg`.

Project links (`links` on a project record) work the same way: add real URLs and the buttons appear.

## How it's put together

```
src/
  content/     every node, once: sections, groups, 17 projects, 19 entries
  network/     layout.ts (positions, view state, camera) and Network.tsx (SVG edges + link nodes)
  app/         App shell, hash routing, appearance, measurement
  components/  header/footer, reading panel, schematics
  styles/      tokens (both appearances) and layout
scripts/check.ts   invariants: counts, unique routes, required cross-connections
```

- **Content** is typed records with stable IDs. `related` lists IDs; connections are symmetric and deduplicated in `content/index.ts`. `note` fields hold internal provenance and are never rendered.
- **Routes** are hash routes, one canonical route per entry (`#/projects/autonomy/nomos`). A short or stale path such as `#/nomos` resolves and is rewritten. Unknown routes show a recovery view. `#/index` lists everything as plain nested links.
- **The graph** is laid out deterministically in world coordinates. Travelling changes one transform on the SVG group and one on each node, both on the same curve, so edges and nodes move together. Nodes are real links; resting points are `inert` until their branch opens.
- **Responsive**: wide screens fan children outward with the reading panel alongside. Below 900px children sit in a column beside their parent, one branch shows at a time, and the reading view follows in normal page flow.
- **Accessibility**: skip link, visible focus, Escape climbs one level, focus moves to the reading heading on arrival and back to the branch node on return, polite live announcements, reduced motion honoured.

## Editing content

Add or change records in `src/content/`, then run `npm run check`. Keep each status and evaluation note honest: simulation results stay simulation results, prototypes stay prototypes.

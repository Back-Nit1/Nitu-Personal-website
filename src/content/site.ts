import type { Link } from './types.ts'

/**
 * Contact destinations. Set a value to make its action appear on the Connect
 * page; leave it undefined and nothing is rendered. Only confirmed, working
 * URLs belong here.
 */
const contact: Record<string, string | undefined> = {
  Email: undefined, // 'mailto:you@example.com'
  LinkedIn: undefined,
  // https://github.com/N1tu-Mar returned 404 when this was built. Confirm the handle, then set it.
  GitHub: undefined,
  Résumé: undefined, // e.g. './resume.pdf' once the file is in public/
}

export const contactLinks: Link[] = Object.entries(contact).flatMap(([label, url]) =>
  url ? [{ label, url }] : [],
)

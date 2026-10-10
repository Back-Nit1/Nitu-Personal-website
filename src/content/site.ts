import type { Link } from './types.ts'

/**
 * Contact destinations. Set a value to make its action appear on the Connect
 * page; leave it undefined and nothing is rendered. Only confirmed, working
 * URLs belong here.
 */
const contact: Record<string, string | undefined> = {
  Email: undefined, // 'mailto:you@example.com'
  LinkedIn: 'https://www.linkedin.com/in/nityanth-maramreddy-7ba0a2208/',
  Résumé:
    'https://docs.google.com/document/d/1mI24ZZBwZTmtUI9f5EGQ-E3IOt4ETWhq/edit?usp=sharing&ouid=117823466610923543736&rtpof=true&sd=true',
  GitHub: 'https://github.com/Back-Nit1',
}

/** The main GitHub account is being recovered (https://github.com/N1tu-Mar returned 404). Shown as text, not a link. */
export const recovering = { handle: 'github.com/N1tu-Mar', note: 'recovering my account😭' }

export const contactLinks: Link[] = Object.entries(contact).flatMap(([label, url]) =>
  url ? [{ label, url }] : [],
)

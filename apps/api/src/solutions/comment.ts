import { z } from 'zod'

// shortcut: catches a scheme, "www." and a handful of common TLDs, so a bare
// domain on any other TLD gets through. Widen the list if spam shows up.
const LINK = /:\/\/|www\.|\.(com|net|org|io|co|me|ly|gg|xyz|app|dev|ru|info|biz)\b/i

// The one piece of player text the judge never reads, on a public page. One
// line, so no control characters (which also stops bidi tricks), and no links.
export const comment = z
  .string()
  .trim()
  .max(280)
  .regex(/^[^\p{Cc}‪-‮⁦-⁩]*$/u, 'one line, no control characters.')
  .refine((s) => !LINK.test(s), 'no links.')

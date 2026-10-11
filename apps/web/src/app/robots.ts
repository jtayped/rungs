import type { MetadataRoute } from 'next'
import { env } from '~/env'

// Nothing is disallowed. Solutions, the feed and the game load from /api in
// the browser, and a crawler that can't fetch them renders those pages empty.
// /account stays crawlable too: it's noindex, and Google has to fetch it to see that.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', env.SITE_URL).href,
  }
}

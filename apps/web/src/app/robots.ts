import type { MetadataRoute } from 'next'
import { env } from '~/env'

// Nothing is disallowed. The game, and the feed past its first page, load from
// /api in the browser, and a crawler that can't fetch /api renders them empty.
// /account stays crawlable too: it's noindex, and Google has to fetch it to
// see that.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', env.SITE_URL).href,
  }
}

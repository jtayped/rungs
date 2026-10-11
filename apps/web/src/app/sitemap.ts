import type { MetadataRoute } from 'next'
import { env } from '~/env'
import { listLadders } from '~/lib/ladder'

// A ladder appears at midnight UTC on its date, so this can't be prerendered.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, env.SITE_URL).href
  const { ladders } = await listLadders()
  return [
    { url: url('/') },
    { url: url('/solutions') },
    ...ladders.flatMap((l) => [
      { url: url(`/ladders/${l.id}`), lastModified: l.date },
      { url: url(`/ladders/${l.id}/about`), lastModified: l.date },
    ]),
  ]
}

import type { MetadataRoute } from 'next'
import { env } from '~/env'
import { listLadders, listSolutions } from '~/lib/ladder'

// A ladder appears at midnight UTC on its date, so this can't be prerendered.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, env.SITE_URL).href
  const { ladders } = await listLadders()
  // shortcut: the list route returns a ladder's 200 shortest posts, so longer
  // ones are left out here. Page through the feed once a ladder passes 200.
  // A ladder whose posts fail to load is left out rather than failing the sitemap.
  const posts = (await Promise.all(ladders.map((l) => listSolutions(l.id).catch(() => [])))).flat()
  return [
    { url: url('/') },
    { url: url('/solutions') },
    ...ladders.flatMap((l) => [
      { url: url(`/ladders/${l.id}`), lastModified: l.date },
      { url: url(`/ladders/${l.id}/about`), lastModified: l.date },
    ]),
    ...posts.map((p) => ({ url: url(`/solutions/${p.id}`), lastModified: p.at })),
  ]
}

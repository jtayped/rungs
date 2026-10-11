import type { Metadata } from 'next'
import { Feed } from '~/components/feed'
import { Page } from '~/components/page'
import { firstFeedPage } from '~/lib/ladder'

// New posts show up as they're made, so this can't be prerendered.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'solutions',
  description: 'the newest solutions on rungs, across every ladder. each one cleared every rule.',
}

export default async function Solutions() {
  const first = await firstFeedPage().catch(() => null)
  return (
    <Page title="solutions">
      <Feed first={first} />
    </Page>
  )
}

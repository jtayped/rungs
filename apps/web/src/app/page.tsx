import type { Metadata } from 'next'
import { Collection } from '~/components/collection'
import { Page } from '~/components/page'
import { listLadders } from '~/lib/ladder'

// A ladder appears at midnight UTC on its date, so this can't be prerendered.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'rungs',
  openGraph: { title: 'rungs', siteName: 'rungs', type: 'website' },
}

export default async function Home() {
  const collection = await listLadders()
  return (
    <Page back={null} title="rungs">
      <p className="text-muted mt-4 text-[19px] leading-[1.45]">
        write until the rule holds. then the next one arrives, and every rule before it has to keep
        holding.
      </p>
      <Collection {...collection} />
      {!collection.ladders.length && !collection.upcoming.length ? (
        <p className="text-muted mt-6 text-[17px]">the first ladder hasn’t gone up yet.</p>
      ) : null}
    </Page>
  )
}

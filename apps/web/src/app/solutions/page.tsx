import type { Metadata } from 'next'
import { Feed } from '~/components/feed'
import { Page } from '~/components/page'

export const metadata: Metadata = {
  title: 'solutions',
  description: 'the newest solutions on rungs, across every ladder. each one cleared every rule.',
}

export default function Solutions() {
  return (
    <Page title="solutions">
      <Feed />
    </Page>
  )
}

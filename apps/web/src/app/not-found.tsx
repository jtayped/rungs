import type { Metadata } from 'next'
import { Page } from '~/components/page'

export const metadata: Metadata = { title: 'not found' }

export default function NotFound() {
  return (
    <Page title="not found">
      <p className="text-muted mt-4 text-[19px] leading-[1.45]">there’s nothing here.</p>
    </Page>
  )
}

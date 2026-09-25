import type { Metadata } from 'next'
import { Account } from '~/components/account'
import { Page } from '~/components/page'

export const metadata: Metadata = { title: 'account' }

export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  const { next } = await searchParams
  // Only same-site paths, so the link can't bounce anyone somewhere else.
  const back = typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : '/'
  return (
    <Page back={{ href: back, label: 'back' }} title="account">
      <Account next={back} />
    </Page>
  )
}

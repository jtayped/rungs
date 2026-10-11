import type { Metadata } from 'next'
import { Account } from '~/components/account'
import { Page } from '~/components/page'

export const metadata: Metadata = {
  title: 'account',
  description:
    'sign in with an email and a code to post solutions. playing never needs an account.',
  robots: { index: false },
}

export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  const { next } = await searchParams
  // Only same-site paths, so the link can't bounce anyone somewhere else.
  // Resolved the way the browser will, since `/\evil.com` and `/\t/evil.com`
  // both look like paths and land on another site.
  const url = typeof next === 'string' ? URL.parse(next, 'http://x') : null
  const back = url?.origin === 'http://x' ? url.pathname + url.search : '/'
  return (
    <Page back={{ href: back, label: 'back' }} title="account">
      <Account next={back} />
    </Page>
  )
}

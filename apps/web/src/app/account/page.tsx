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
  const back = typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : '/'
  return (
    <Page back={{ href: back, label: 'back' }} title="account">
      <Account next={back} />
    </Page>
  )
}

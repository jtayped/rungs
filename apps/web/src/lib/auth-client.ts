'use client'

import { anonymousClient, emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

// Same origin as the page: Next forwards /api/auth/* to the API untouched.
export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [emailOTPClient(), anonymousClient()],
})

// Players who haven't signed in still have an anonymous session that holds
// their progress. Everywhere else in the app, that counts as signed out.
export function useAccount() {
  const { data, ...rest } = authClient.useSession()
  return { data: data && !data.user.isAnonymous ? data : null, ...rest }
}

// The first draft that needs judging opens the anonymous session. Shared, so
// two drafts judged at once don't open two.
let opening: Promise<boolean> | null = null
export function openSession() {
  opening ??= authClient.signIn.anonymous().then(({ error }) => {
    opening = null
    return !error
  })
  return opening
}

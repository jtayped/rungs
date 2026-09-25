'use client'

import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

// Same origin as the page: Next forwards /api/auth/* to the API untouched.
export const authClient = createAuthClient({ basePath: '/api/auth', plugins: [emailOTPClient()] })

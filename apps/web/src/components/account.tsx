'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '~/lib/auth-client'

const field =
  'bg-sheet ring-hairline focus:ring-hue h-14 w-full rounded-full px-6 text-[17px] ring-1 outline-none'
const button =
  'bg-ink text-ground h-14 rounded-full px-8 text-[17px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60'

// Playing never needs an account. This page exists for posting solutions.
export function Account({ next }: { next: string }) {
  const { data, isPending } = authClient.useSession()
  if (isPending) return null
  return data ? <SignedIn email={data.user.email} name={data.user.name} /> : <SignIn next={next} />
}

function SignIn({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
    setBusy(false)
    if (error) return setError('couldn’t send a code to that address.')
    setError(null)
    setStep('code')
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await authClient.signIn.emailOtp({ email, otp: code.trim() })
    setBusy(false)
    if (error) return setError('that code didn’t work. check it, or send a new one.')
    router.push(next)
    router.refresh()
  }

  return (
    <div className="mt-6">
      <p className="text-muted text-[17px] leading-[1.45]">
        {step === 'email'
          ? 'you only need an account to post solutions. no password: we email you a code.'
          : `we sent a code to ${email}. it lasts ten minutes.`}
      </p>
      {step === 'email' ? (
        <form onSubmit={send} className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="email"
            className={field}
          />
          <button type="submit" disabled={busy} className={button}>
            {busy ? 'sending…' : 'send a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 flex flex-col gap-3">
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            aria-label="code"
            className={`${field} tracking-[0.3em] tabular-nums`}
          />
          <button type="submit" disabled={busy} className={button}>
            {busy ? 'checking…' : 'sign in'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('email')
              setCode('')
              setError(null)
            }}
            className="text-muted mt-1 text-[15px] font-medium underline-offset-4 hover:underline"
          >
            use a different email
          </button>
        </form>
      )}
      {error ? <p className="text-muted mt-4 px-2 text-[15px]">{error}</p> : null}
    </div>
  )
}

function SignedIn({ email, name: initial }: { email: string; name: string }) {
  const router = useRouter()
  const [name, setName] = useState(initial)
  const [saved, setSaved] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await authClient.updateUser({ name: name.trim() })
    if (!error) setSaved(true)
  }

  return (
    <div className="mt-6">
      <p className="text-muted text-[17px]">signed in as {email}</p>
      <form onSubmit={save} className="mt-8 flex flex-col gap-3">
        <label htmlFor="name" className="text-muted px-2 text-[13px] font-medium">
          the name your solutions are posted under
        </label>
        <input
          id="name"
          required
          maxLength={40}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
          className={field}
        />
        <button type="submit" disabled={!name.trim() || name === initial} className={button}>
          {saved ? 'saved' : 'save'}
        </button>
      </form>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut()
          router.refresh()
        }}
        className="text-muted mt-8 text-[15px] font-medium underline-offset-4 hover:underline"
      >
        sign out
      </button>
    </div>
  )
}

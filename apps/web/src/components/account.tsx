'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authClient, useAccount } from '~/lib/auth-client'
import { setSpoilsAll, spoilsAll } from '~/lib/storage'
import { track } from '~/lib/track'

const field =
  'bg-sheet ring-hairline focus:ring-hue h-14 w-full rounded-full px-6 text-[17px] ring-1 outline-none'
const button =
  'bg-ink text-ground h-14 rounded-full px-8 text-[17px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60'

// Playing never needs an account. One lets a player post solutions and keeps
// their progress across devices.
export function Account({ next }: { next: string }) {
  const { data, isPending, isRefetching } = useAccount()
  // Coming back to the tab refetches the session, and while signed out that
  // flips isPending on again. Only hide on the first load, or the code step
  // would unmount and drop the email it was waiting on.
  if (isPending && !isRefetching) return null
  return (
    <>
      {data ? <SignedIn email={data.user.email} name={data.user.name} /> : <SignIn next={next} />}
      <SpoilerSetting />
    </>
  )
}

// Per device, like the yes given for each ladder.
function SpoilerSetting() {
  const [on, setOn] = useState(true)
  // localStorage only exists after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOn(!spoilsAll()), [])

  return (
    <label className="bg-sheet ring-hairline mt-12 flex items-center gap-4 rounded-[26px] p-5 ring-1 backdrop-blur-2xl sm:p-6">
      <span className="flex-1">
        <span className="block text-[17px] font-semibold tracking-[-0.015em]">
          spoiler protection
        </span>
        <span className="text-muted mt-1 block text-[15px] leading-snug">
          ask before showing the explanation or solutions of a ladder you haven’t cleared. only on
          this device.
        </span>
      </span>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          setOn(e.target.checked)
          setSpoilsAll(!e.target.checked)
        }}
        className="accent-ink size-6 shrink-0"
      />
    </label>
  )
}

function SignIn({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A dropped connection throws instead of returning an error.
  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
      if (error) {
        return setError(
          error.status === 429
            ? 'too many codes asked for. try again in a while.'
            : 'couldn’t send a code to that address.',
        )
      }
      setError(null)
      setStep('code')
      track('sign-in-code-sent')
    } catch {
      setError('couldn’t send a code to that address.')
    } finally {
      setBusy(false)
    }
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await authClient.signIn.emailOtp({ email, otp: code.trim() })
      if (error) return setError('that code didn’t work. check it, or send a new one.')
      track('signed-in')
      router.push(next)
      router.refresh()
    } catch {
      setError('that code didn’t work. check it, or send a new one.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6">
      <p className="text-muted text-[17px] leading-[1.45]">
        {step === 'email'
          ? 'an account lets you post solutions and keeps your progress on every device. no password: we email you a code.'
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
      {error ? (
        <p role="alert" className="text-muted mt-4 px-2 text-[15px]">
          {error}
        </p>
      ) : null}
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

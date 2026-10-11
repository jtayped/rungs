'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpoilers } from '~/lib/progress'

// Asks before giving a ladder away, with the option to stop asking for every
// ladder. A sheet from the bottom on phones, a card in the middle elsewhere.
export function SpoilerDialog({
  title,
  onShow,
  onClose,
}: {
  title: string
  onShow: (all: boolean) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [all, setAll] = useState(false)
  useEffect(() => {
    // Strict mode runs this twice, and the second call would find it open.
    if (!ref.current?.open) ref.current?.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="spoiler-title"
      className="bg-ground text-ink ring-hairline backdrop:bg-ground/60 m-0 mt-auto w-full max-w-none rounded-t-[30px] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] ring-1 backdrop:backdrop-blur-xl sm:m-auto sm:max-w-md sm:rounded-[30px] sm:p-8"
    >
      <h2 id="spoiler-title" className="text-[22px] leading-snug font-semibold tracking-[-0.02em]">
        this gives away {title}.
      </h2>
      <p className="text-muted mt-2 text-[15px] leading-snug">
        if you haven’t cleared it, it shows you every rule you haven’t reached yet.
      </p>
      <label className="mt-6 flex items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => setAll(e.target.checked)}
          className="accent-ink size-5"
        />
        don’t ask again, for any ladder
      </label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onShow(all)}
          className="bg-ink text-ground h-12 rounded-full px-6 text-[15px] font-semibold transition-transform active:scale-[0.97]"
        >
          show it
        </button>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="bg-sheet ring-hairline h-12 rounded-full px-6 text-[15px] font-semibold ring-1 transition-transform active:scale-[0.97]"
        >
          not yet
        </button>
      </div>
    </dialog>
  )
}

// Explanations and solutions sit behind this. Until the player says yes they
// render blurred and out of reach, with a button that asks.
export function Spoiler({
  ladder,
  title,
  children,
}: {
  ladder: string
  title: string
  children: React.ReactNode
}) {
  const { shown, show } = useSpoilers()
  const [asking, setAsking] = useState(false)
  if (shown(ladder)) return children

  return (
    <div className="relative mt-10">
      <div aria-hidden inert className="max-h-96 overflow-hidden blur-md select-none">
        {children}
      </div>
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="absolute inset-0 grid place-items-center"
      >
        <span className="bg-ink text-ground h-12 rounded-full px-6 text-[15px] leading-12 font-semibold">
          show the explanation and solutions
        </span>
      </button>
      {asking ? (
        <SpoilerDialog
          title={title}
          onShow={(all) => show(ladder, all)}
          onClose={() => setAsking(false)}
        />
      ) : null}
    </div>
  )
}

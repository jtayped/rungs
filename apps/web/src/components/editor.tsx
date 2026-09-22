'use client'

import { useLayoutEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (text: string) => void
  pending: boolean
  limit: number | null
  error: string | null
  note: string | null
}

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0)

// A sheet of paper and nothing else. It grows with the text, so the page
// scrolls rather than the box.
export function Editor({ value, onChange, pending, limit, error, note }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const words = countWords(value)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="bg-sheet ring-hairline rounded-[30px] p-2 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-24px_rgb(0_0_0/0.18)] ring-1 backdrop-blur-2xl">
      <label htmlFor="draft" className="sr-only">
        your text
      </label>
      <textarea
        id="draft"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="start writing…"
        rows={6}
        autoFocus
        spellCheck
        autoCapitalize="sentences"
        className="placeholder:text-muted/60 block min-h-[38svh] w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[19px] leading-[1.55] tracking-[-0.012em] outline-none sm:min-h-[46svh] sm:px-6 sm:pt-6 sm:text-[21px]"
      />
      <div className="text-muted flex items-center justify-between gap-4 px-4 pt-1 pb-3 text-[13px] sm:px-6">
        <span className="tabular-nums">
          {limit ? (
            <span className={words > limit ? 'text-ink font-semibold' : undefined}>
              {words} / {limit} words
            </span>
          ) : (
            `${words} ${words === 1 ? 'word' : 'words'}`
          )}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {error || note ? <span className="truncate">{error ?? note}</span> : null}
          <span
            aria-hidden
            className={`bg-hue size-2 shrink-0 rounded-full transition-opacity ${pending ? 'animate-pulse opacity-100' : 'opacity-30'}`}
          />
          <span className="sr-only" aria-live="polite">
            {pending ? 'reading' : ''}
          </span>
        </span>
      </div>
    </div>
  )
}

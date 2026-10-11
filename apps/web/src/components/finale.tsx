'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { track } from '~/lib/track'
import { Restart, Share } from './icons'
import { PostSolution } from './post-solution'

type Props = {
  ladder: string
  title: string
  text: string
  words: number
  best: number | null
  onRestart: () => void
  onClose: () => void
}

// A modal dialog, so focus moves into it, Escape closes it and the editor
// behind can't take keystrokes that would change the text being posted.
export function Finale({ ladder, title, text, words, best, onRestart, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Strict mode runs this twice, and the second call would find it open.
    if (!ref.current?.open) ref.current?.showModal()
    // The heading takes focus rather than the first field, which would open
    // the keyboard on a phone.
    heading.current?.focus()
  }, [])

  const share = async () => {
    const body = `${text.trim()}\n\n— ${title}`
    try {
      if (navigator.share) {
        await navigator.share({ text: body })
        return track('share', { ladder, method: 'share' })
      }
      await navigator.clipboard.writeText(body)
      track('share', { ladder, method: 'copy' })
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Share sheet dismissed.
    }
  }

  return (
    <motion.dialog
      ref={ref}
      aria-labelledby="finale-title"
      // Escape closes it the same way "keep editing" does, so it fades out.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClose={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-ground/60 text-ink fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto backdrop-blur-3xl backdrop:bg-transparent"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-5 pt-16 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-8"
      >
        <p className="text-muted text-[15px] font-medium">{title}</p>
        <h2
          ref={heading}
          id="finale-title"
          tabIndex={-1}
          className="font-display mt-2 text-[clamp(3rem,13vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] outline-none"
        >
          every rule holds.
        </h2>

        <blockquote className="bg-sheet ring-hairline mt-8 rounded-[30px] p-6 text-[19px] leading-[1.55] tracking-[-0.012em] whitespace-pre-wrap ring-1 sm:p-8 sm:text-[21px]">
          {text.trim()}
        </blockquote>

        <p className="text-muted mt-4 px-2 text-[13px] tabular-nums">
          {words} words{best != null && best < words ? ` · your best is ${best}` : ''}
          {best === words ? ' · your best yet' : ''}
        </p>

        <PostSolution ladder={ladder} text={text} />

        <div className="mt-3 grid grid-cols-2 gap-3 sm:flex">
          <button
            type="button"
            onClick={share}
            className="bg-ink text-ground flex h-14 items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold transition-transform active:scale-[0.97]"
          >
            <Share className="size-5" />
            {copied ? 'copied' : 'share'}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="bg-sheet ring-hairline flex h-14 items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold ring-1 transition-transform active:scale-[0.97]"
          >
            <Restart className="size-5" />
            again
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted mt-5 self-center text-[15px] font-medium underline-offset-4 hover:underline sm:self-start sm:px-2"
        >
          keep editing
        </button>
      </motion.div>
    </motion.dialog>
  )
}

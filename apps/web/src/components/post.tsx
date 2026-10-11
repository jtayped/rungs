import Link from 'next/link'
import { formatDate } from './page'

export function Post({ text, comment }: { text: string; comment: string | null }) {
  return (
    <>
      <p className="text-[17px] leading-[1.55] tracking-[-0.012em] whitespace-pre-wrap">{text}</p>
      {comment ? (
        <p className="text-muted border-hairline mt-4 border-l-2 pl-3 text-[15px] leading-snug">
          {comment}
        </p>
      ) : null}
    </>
  )
}

// Who posted it, its length and its date. The date links to the post's own
// page. `at` starts with the day either way the API prints it.
export function Byline({
  id,
  name,
  words,
  at,
  children,
}: {
  id: number
  name: string
  words: number
  at: string
  children?: React.ReactNode
}) {
  return (
    <p className="text-muted mt-3 flex items-center gap-1.5 text-[13px]">
      <span className="text-ink font-medium">{name}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">{words} words</span>
      <span aria-hidden>·</span>
      <Link href={`/solutions/${id}`} className="hover:text-ink underline-offset-4 hover:underline">
        {formatDate(at.slice(0, 10))}
      </Link>
      {children}
    </p>
  )
}

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { api, type FeedItem } from '~/lib/api'
import { useSpoilers } from '~/lib/progress'
import { Post } from './solutions'
import { SpoilerDialog } from './spoiler'

// The newest posts across every ladder, loaded a page at a time as the end
// scrolls into view. Posts on ladders the player hasn't cleared stay blurred
// until they say yes for that ladder.
export function Feed() {
  const { shown, show } = useSpoilers()
  const [items, setItems] = useState<FeedItem[]>([])
  // undefined before the first page, null once there are no more.
  const [next, setNext] = useState<string | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [asking, setAsking] = useState<{ ladder: string; title: string } | null>(null)
  const end = useRef<HTMLDivElement>(null)
  // The observer can fire twice for one cursor before the page lands.
  const requested = useRef<string | null | undefined>(null)

  useEffect(() => {
    const el = end.current
    if (!el || next === null || failed) return
    const load = async () => {
      if (requested.current === next) return
      requested.current = next
      try {
        const res = await api.solutions.$get({ query: next ? { before: next } : {} })
        if (!res.ok) throw new Error(String(res.status))
        const page = await res.json()
        setItems((i) => [...i, ...page.items])
        setNext(page.next)
      } catch {
        setFailed(true)
      }
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) void load()
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [next, failed])

  return (
    <>
      <ol className="mt-10 flex flex-col gap-3">
        {items.map((s) => {
          const open = shown(s.ladder)
          const body = (
            <>
              <Post text={s.text} comment={s.comment} />
              <p className="text-muted mt-3 text-[13px]">
                <span className="text-ink font-medium">{s.name}</span>
                <span className="tabular-nums"> · {s.words} words</span>
              </p>
            </>
          )
          return (
            <li
              key={s.id}
              className="bg-sheet ring-hairline rounded-[26px] p-5 ring-1 backdrop-blur-2xl sm:p-6"
            >
              <Link
                href={`/ladders/${s.ladder}/about`}
                className="text-muted hover:text-ink mb-3 inline-block text-[13px] font-medium"
              >
                {s.title}
              </Link>
              {open ? (
                body
              ) : (
                <button
                  type="button"
                  onClick={() => setAsking({ ladder: s.ladder, title: s.title })}
                  aria-label={`show a solution to ${s.title}`}
                  className="relative block w-full text-left"
                >
                  <div aria-hidden inert className="blur-md select-none">
                    {body}
                  </div>
                  <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold">
                    tap to show
                  </span>
                </button>
              )}
            </li>
          )
        })}
      </ol>

      {failed ? (
        <p className="text-muted mt-6 px-1 text-[15px]">
          couldn’t load more.{' '}
          <button
            type="button"
            onClick={() => {
              requested.current = null
              setFailed(false)
            }}
            className="text-ink font-semibold underline-offset-4 hover:underline"
          >
            try again
          </button>
        </p>
      ) : next === null ? (
        <p className="text-muted mt-6 px-1 text-[15px]">
          {items.length ? 'that’s every one.' : 'nobody has posted one yet.'}
        </p>
      ) : (
        <div className="bg-sheet ring-hairline mt-3 h-32 animate-pulse rounded-[26px] ring-1" />
      )}
      <div ref={end} />

      {asking ? (
        <SpoilerDialog
          title={asking.title}
          onShow={(all) => {
            show(asking.ladder, all)
            setAsking(null)
          }}
          onClose={() => setAsking(null)}
        />
      ) : null}
    </>
  )
}

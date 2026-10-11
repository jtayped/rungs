'use client'

import { useEffect, useState } from 'react'
import { api, type Solution } from '~/lib/api'

// Everyone's posts on one ladder, fewest words first. It sits behind the
// spoiler gate on the about page.
export function Solutions({ ladder }: { ladder: string }) {
  const [list, setList] = useState<Solution[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    void api.ladders[':id'].solutions
      .$get({ param: { id: ladder } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setList, () => setFailed(true))
  }, [ladder])

  const remove = async () => {
    await api.ladders[':id'].solutions.mine.$delete({ param: { id: ladder } })
    setList((l) => l?.filter((s) => !s.mine) ?? null)
  }

  return (
    <section aria-label="solutions" className="mt-12">
      <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">solutions</h2>

      {failed ? (
        <p className="text-muted px-1 text-[15px]">couldn’t load them. try again in a moment.</p>
      ) : !list ? (
        <div className="bg-sheet ring-hairline h-32 animate-pulse rounded-[26px] ring-1" />
      ) : !list.length ? (
        <p className="text-muted px-1 text-[15px]">nobody has posted one yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {list.map((s) => (
            <li
              key={s.id}
              className={`bg-sheet rounded-[26px] p-5 ring-1 backdrop-blur-2xl sm:p-6 ${s.mine ? 'ring-hue' : 'ring-hairline'}`}
            >
              <Post text={s.text} comment={s.comment} />
              <p className="text-muted mt-3 flex items-center gap-2 text-[13px]">
                <span className="text-ink font-medium">{s.name}</span>
                <span className="tabular-nums">· {s.words} words</span>
                {s.mine ? (
                  <button
                    type="button"
                    onClick={remove}
                    className="hover:text-ink ml-auto underline-offset-4 hover:underline"
                  >
                    remove yours
                  </button>
                ) : null}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

// A post's text and the player's comment on it.
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

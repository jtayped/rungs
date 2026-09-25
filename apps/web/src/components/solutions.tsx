'use client'

import { useEffect, useState } from 'react'
import { api, type Solution } from '~/lib/api'
import { spoil, spoiled } from '~/lib/storage'

// Other people's solutions are one click away, but that click is a choice:
// nothing is fetched until the player says yes, and the yes is remembered.
export function Solutions({ ladder }: { ladder: string }) {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<Solution[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // localStorage only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (spoiled(ladder)) setOpen(true)
  }, [ladder])

  useEffect(() => {
    if (!open) return
    void api.ladders[':id'].solutions
      .$get({ param: { id: ladder } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setList, () => setFailed(true))
  }, [open, ladder])

  const remove = async () => {
    await api.ladders[':id'].solutions.mine.$delete({ param: { id: ladder } })
    setList((l) => l?.filter((s) => !s.mine) ?? null)
  }

  return (
    <section aria-label="solutions" className="mt-12">
      <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">solutions</h2>

      {!open ? (
        <div className="bg-sheet ring-hairline rounded-[26px] p-6 ring-1 backdrop-blur-2xl">
          <p className="text-[17px] leading-snug font-semibold tracking-[-0.015em]">
            see other people’s solutions?
          </p>
          <p className="text-muted mt-1 text-[15px] leading-snug">
            each one is a full answer, every rule included. if you haven’t finished this ladder, it
            gives the rest away.
          </p>
          <button
            type="button"
            onClick={() => {
              spoil(ladder)
              setOpen(true)
            }}
            className="bg-ink text-ground mt-5 h-12 rounded-full px-6 text-[15px] font-semibold transition-transform active:scale-[0.97]"
          >
            show them
          </button>
        </div>
      ) : failed ? (
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
              <p className="text-[17px] leading-[1.55] tracking-[-0.012em] whitespace-pre-wrap">
                {s.text}
              </p>
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

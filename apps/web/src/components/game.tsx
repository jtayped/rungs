'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { LadderInfo } from '~/lib/api'
import { hue, HUES, SPECTRUM } from '~/lib/palette'
import { useLadder } from '~/lib/use-ladder'
import { Aura } from './aura'
import { Editor } from './editor'
import { Finale } from './finale'
import { GitHub, Restart } from './icons'
import { iconButton, Nav } from './nav'
import { Progress } from './progress'
import { RuleHero } from './rule-hero'
import { RuleList } from './rule-list'

const REPO_URL = 'https://github.com/jtayped/rungs'

export function Game({ ladder: info }: { ladder: LadderInfo }) {
  const ladder = useLadder(info)

  const current = ladder.rules.at(-1)
  const earlier = ladder.rules.slice(0, -1)
  const at = current?.index ?? 0
  const empty = !ladder.text.trim()
  const limit = ladder.rules.find((r) => r.words)?.words?.max ?? null
  const showFinale = ladder.celebrate

  // Current colour leads, the next one waits at the edge of the page.
  const colors = showFinale ? HUES : [hue(at), hue(at + 1), hue(at - 1)]

  return (
    <div
      // Isolated so the aura's negative z-index stays above the body background.
      className="hue-shift relative isolate min-h-svh"
      style={{ '--hue': showFinale ? HUES[7] : hue(at) } as React.CSSProperties}
    >
      <Aura colors={ladder.ready ? colors : SPECTRUM} />

      {ladder.ready ? (
        <motion.main
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto min-h-svh max-w-6xl px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-8 sm:pt-8"
        >
          <h1 className="sr-only">{info.title}</h1>
          <div className="flex h-8 items-center justify-between gap-4">
            <Progress rules={ladder.rules} total={ladder.total} />
            <div className="flex items-center gap-1 sm:gap-2">
              <Nav ladder={info.id} />
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="source on github"
                className={`${iconButton} max-sm:hidden`}
              >
                <GitHub className="size-4" />
              </a>
              <button
                type="button"
                onClick={ladder.restart}
                aria-label="start over"
                className="bg-hairline text-muted hover:text-ink grid size-8 place-items-center rounded-full transition-colors active:scale-95"
              >
                <Restart className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 pt-8 [grid-template-areas:'hero''editor''list'] sm:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10 lg:pt-16 lg:[grid-template-areas:'hero_editor''list_editor']">
            <div className="[grid-area:hero]">
              <RuleHero rule={current} empty={empty} pending={ladder.pending} />
            </div>
            <div className="[grid-area:editor] lg:sticky lg:top-8 lg:self-start">
              <Editor
                value={ladder.text}
                onChange={ladder.write}
                pending={ladder.pending}
                limit={limit}
                error={ladder.error}
                note={ladder.degenerate ? 'try a few more different words' : null}
              />
            </div>
            <div className="[grid-area:list]">
              <RuleList rules={earlier} empty={empty} />
            </div>
          </div>
        </motion.main>
      ) : null}

      <AnimatePresence>
        {showFinale ? (
          <Finale
            key="finale"
            ladder={info.id}
            title={info.title}
            text={ladder.text}
            words={ladder.words}
            best={ladder.best}
            onRestart={ladder.restart}
            onClose={ladder.dismiss}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

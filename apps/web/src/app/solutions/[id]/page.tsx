import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, Page } from '~/components/page'
import { Post } from '~/components/post'
import { Spoiler } from '~/components/spoiler'
import { getLadder, getSolution } from '~/lib/ladder'

export async function generateMetadata({
  params,
}: PageProps<'/solutions/[id]'>): Promise<Metadata> {
  const { name, title, words } = await getSolution((await params).id)
  return {
    title: `${name}’s solution to ${title}`,
    description: `${name} cleared every rule of ${title} in ${words} words. play it on rungs, then read how they did it.`,
  }
}

// One post on its own page, so it has a link to share. The text gives the
// ladder away, so it's behind the same spoiler gate as everywhere else.
export default async function Solution({ params }: PageProps<'/solutions/[id]'>) {
  const s = await getSolution((await params).id)
  const { first, total } = await getLadder(s.ladder)
  return (
    <Page
      back={{ href: `/ladders/${s.ladder}/about`, label: s.title }}
      eyebrow={`${formatDate(s.at.slice(0, 10))} · ${s.words} words`}
      title={`${s.name}’s solution`}
    >
      <p className="text-muted mt-4 text-[19px] leading-[1.45]">
        a solution to{' '}
        <Link
          href={`/ladders/${s.ladder}/about`}
          className="text-ink underline-offset-4 hover:underline"
        >
          {s.title}
        </Link>{' '}
        that holds all {total} rules. rule 1 is “{first}”
      </p>
      <Spoiler ladder={s.ladder} title={s.title} label="show the solution">
        <article className="bg-sheet ring-hairline mt-10 rounded-[26px] p-5 ring-1 backdrop-blur-2xl sm:p-6">
          <Post text={s.text} comment={s.comment} />
        </article>
      </Spoiler>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/ladders/${s.ladder}`}
          className="bg-ink text-ground inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold transition-transform active:scale-[0.97]"
        >
          play it
        </Link>
        <Link
          href={`/ladders/${s.ladder}/about`}
          className="bg-sheet ring-hairline inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold ring-1 transition-transform active:scale-[0.97]"
        >
          every solution
        </Link>
      </div>
    </Page>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Hints } from '~/components/hints'
import { Mdx } from '~/components/mdx'
import { formatDate, Page } from '~/components/page'
import { Solutions } from '~/components/solutions'
import { getLadder } from '~/lib/ladder'

export async function generateMetadata({
  params,
}: PageProps<'/ladders/[id]/about'>): Promise<Metadata> {
  const { title } = await getLadder((await params).id)
  return { title: `about ${title}` }
}

export default async function About({ params }: PageProps<'/ladders/[id]/about'>) {
  const ladder = await getLadder((await params).id)
  return (
    <Page
      back={{ href: '/ladders', label: 'past ladders' }}
      eyebrow={`${formatDate(ladder.date)} · ${ladder.total} rules`}
      title={ladder.title}
    >
      <Link
        href={`/ladders/${ladder.id}`}
        className="bg-ink text-ground mt-6 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold transition-transform active:scale-[0.97]"
      >
        play it
      </Link>
      {ladder.explanation ? (
        <article className="mt-10">
          <Mdx source={ladder.explanation} />
        </article>
      ) : null}
      <Hints hints={ladder.hints} />
      <Solutions ladder={ladder.id} />
    </Page>
  )
}

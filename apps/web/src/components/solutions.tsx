import { cookies } from 'next/headers'
import { listSolutions } from '~/lib/ladder'
import { Byline, Post } from './post'
import { RemoveMine } from './remove-mine'

// Everyone's posts on one ladder, fewest words first. It sits behind the
// spoiler gate on the about page, and renders on the server so the posts are
// in the page's HTML.
export async function Solutions({ ladder }: { ladder: string }) {
  const list = await listSolutions(ladder, (await cookies()).toString()).catch(() => null)

  return (
    <section aria-label="solutions" className="mt-12">
      <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">solutions</h2>

      {!list ? (
        <p className="text-muted px-1 text-[15px]">couldn’t load them. try again in a moment.</p>
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
              <Byline id={s.id} name={s.name} words={s.words} at={s.at}>
                {s.mine ? <RemoveMine ladder={ladder} /> : null}
              </Byline>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

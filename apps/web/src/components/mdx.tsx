import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

// Explanations are written by hand in the repo and synced into the database,
// so they're trusted and compiled on the server as they are.
const components = {
  h2: (p: React.ComponentProps<'h2'>) => (
    <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.02em] first:mt-0" {...p} />
  ),
  h3: (p: React.ComponentProps<'h3'>) => (
    <h3 className="mt-8 mb-2 text-[17px] font-semibold tracking-[-0.015em]" {...p} />
  ),
  p: (p: React.ComponentProps<'p'>) => <p className="mt-3 first:mt-0" {...p} />,
  ul: (p: React.ComponentProps<'ul'>) => <ul className="mt-3 list-disc space-y-1.5 pl-5" {...p} />,
  ol: (p: React.ComponentProps<'ol'>) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-5" {...p} />
  ),
  a: (p: React.ComponentProps<'a'>) => (
    <a className="text-hue underline underline-offset-4" {...p} />
  ),
  blockquote: (p: React.ComponentProps<'blockquote'>) => (
    <blockquote className="border-hairline text-muted mt-4 border-l-2 pl-4" {...p} />
  ),
  code: (p: React.ComponentProps<'code'>) => (
    <code className="bg-hairline rounded-md px-1.5 py-0.5 text-[0.9em]" {...p} />
  ),
}

export async function Mdx({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, runtime)
  return (
    <div className="text-[17px] leading-[1.6] tracking-[-0.01em]">
      <Content components={components} />
    </div>
  )
}

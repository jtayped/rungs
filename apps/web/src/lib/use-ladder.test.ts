import { GlobalRegistrator } from '@happy-dom/global-registrator'
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type * as ReactModule from 'react'
import type { createRoot as CreateRoot } from 'react-dom/client'
import type { useLadder as UseLadder } from './use-ladder'

// The hook runs in a real React tree against a fake api, on real timers, so
// the typing pause and the beat after a reveal take their actual time.

type Call = { text: string; unlocked: number }
type Route = (path: string, body: Call | null) => Response | Promise<Response>

let route: Route
const json = (body: unknown, status = 200) => Response.json(body, { status })
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const rule = (id: string, satisfied: boolean) => ({
  id,
  text: id,
  hint: id,
  satisfied,
  progress: satisfied ? 1 : 0,
})
const score = (unlocked: number, revealed: string | null) => ({
  words: 1,
  degenerate: false,
  rules: Array.from({ length: unlocked }, (_, i) => rule(`r${i + 1}`, revealed != null)),
  unlocked: revealed ? unlocked + 1 : unlocked,
  revealed: revealed ? { id: revealed, text: revealed, hint: revealed } : null,
  cleared: false,
})

// Imported once the DOM exists, since react-dom checks for it on load.
let React: typeof ReactModule
let createRoot: typeof CreateRoot
let useLadder: typeof UseLadder

before(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000/' })
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href)
    const body = init?.body ? (JSON.parse(String(init.body)) as Call) : null
    return route(url.pathname, body)
  }) as typeof fetch
  React = await import('react')
  ;({ createRoot } = await import('react-dom/client'))
  ;({ useLadder } = await import('./use-ladder'))
})

after(() => GlobalRegistrator.unregister())

// Renders the hook for one ladder and hands back its latest state.
async function mount(id: string) {
  const view: { current: ReturnType<typeof useLadder> | null } = { current: null }
  function Probe() {
    view.current = useLadder({ id, title: id, date: '2026-01-01', total: 3 })
    return null
  }
  const root = createRoot(document.createElement('div'))
  await React.act(async () => root.render(React.createElement(Probe)))
  const until = async (done: () => boolean, ms = 6000) => {
    for (const end = Date.now() + ms; !done();) {
      if (Date.now() > end) throw new Error('timed out')
      await React.act(() => sleep(25))
    }
  }
  return { view: () => view.current!, until, unmount: () => React.act(() => root.unmount()) }
}

test('a failed draft load waits and retries rather than opening empty', async () => {
  const calls: Call[] = []
  let loads = 0
  route = (path, body) => {
    if (path === '/api/me/progress/load') {
      return ++loads === 1 ? json({}, 502) : json({ text: 'saved draft', unlocked: 2, best: null })
    }
    calls.push(body!)
    return json(score(2, null))
  }

  const { view, until, unmount } = await mount('load')
  await until(() => view().error != null)
  assert.equal(view().ready, false)
  assert.deepEqual(calls, [])

  await until(() => view().ready)
  assert.equal(view().text, 'saved draft')
  await until(() => calls.length > 0)
  assert.deepEqual(calls, [{ text: 'saved draft', unlocked: 2 }])
  await unmount()
})

test('typing while a rule is being revealed judges the newest text', async () => {
  const calls: Call[] = []
  route = async (path, body) => {
    if (path === '/api/me/progress/reveal') return json(null)
    calls.push(body!)
    if (body!.text === 'first') {
      await sleep(300)
      return json(score(1, 'r2'))
    }
    return json(score(body!.unlocked, null))
  }

  const { view, until, unmount } = await mount('reveal')
  await until(() => calls.length === 1)
  await React.act(async () => view().write('first'))
  await until(() => calls.length === 2)
  await React.act(async () => view().write('first second'))
  await until(() => calls.length === 3)
  // Longer than the beat after a reveal, so a late judge of the old text shows.
  await React.act(() => sleep(1300))

  assert.deepEqual(calls, [
    { text: '', unlocked: 1 },
    { text: 'first', unlocked: 1 },
    { text: 'first second', unlocked: 2 },
  ])
  await unmount()
})

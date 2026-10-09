import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Hono } from 'hono'
import { trustCloudflare } from './cloudflare'

const app = new Hono()
  .use(trustCloudflare)
  .post('/', async (c) =>
    c.json({ ip: c.req.header('cf-connecting-ip') ?? null, ...(await c.req.json()) }),
  )

const seen = async (headers: Record<string, string>) => {
  const res = await app.request('/', { method: 'POST', headers, body: '{"body":"kept"}' })
  return res.json()
}

test('keeps the visitor address when Cloudflare is the last hop', async () => {
  assert.deepEqual(
    await seen({ 'cf-connecting-ip': '198.51.100.7', 'x-forwarded-for': '162.158.1.1' }),
    { ip: '198.51.100.7', body: 'kept' },
  )
  assert.deepEqual(
    await seen({ 'cf-connecting-ip': '2001:db8::7', 'x-forwarded-for': '2606:4700::1' }),
    { ip: '2001:db8::7', body: 'kept' },
  )
})

test('keys a direct caller by its own address, whatever it claims', async () => {
  assert.deepEqual(
    await seen({
      'cf-connecting-ip': '198.51.100.7',
      'x-forwarded-for': '162.158.1.1, 203.0.113.9',
    }),
    { ip: '203.0.113.9', body: 'kept' },
  )
})

test('drops the claim when nothing says who connected', async () => {
  assert.deepEqual(await seen({ 'cf-connecting-ip': '198.51.100.7' }), { ip: null, body: 'kept' })
})

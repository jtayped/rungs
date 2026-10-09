import { BlockList, isIP } from 'node:net'
import { createMiddleware } from 'hono/factory'

// https://www.cloudflare.com/ips/
// shortcut: a copy of Cloudflare's published list; re-copy it when they
// announce new ranges, or their new edges get keyed as one visitor each.
const RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
]

const family = (ip: string) => (isIP(ip) === 6 ? 'ipv6' : 'ipv4')

const cloudflare = new BlockList()
for (const range of RANGES) {
  const [network, bits] = range.split('/') as [string, string]
  cloudflare.addSubnet(network, Number(bits), family(network))
}

// The origin's address is public, so anyone can skip Cloudflare and send their
// own cf-connecting-ip. Traefik appends the address that connected to it to
// x-forwarded-for, and the Next rewrite adds no hop, so the last entry is who
// reached the server. Unless that is Cloudflare, the header is replaced with
// it, and every limiter downstream keys on the real sender.
export const trustCloudflare = createMiddleware(async (c, next) => {
  const peer = c.req.header('x-forwarded-for')?.split(',').at(-1)?.trim() ?? ''
  const known = isIP(peer) !== 0
  if (!known || !cloudflare.check(peer, family(peer))) {
    const headers = new Headers(c.req.raw.headers)
    if (known) headers.set('cf-connecting-ip', peer)
    else headers.delete('cf-connecting-ip')
    c.req.raw = new Request(c.req.raw, { headers })
  }
  await next()
})

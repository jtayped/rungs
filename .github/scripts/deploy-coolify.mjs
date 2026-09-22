// POSTs the Coolify deploy webhook, then waits until the commit that was just
// built is the one answering in production.
//
// A compose service in Coolify has no deployment record to poll, and the
// webhook answers before the stack is recreated, while the old containers are
// still serving. So "does anything answer" passes instantly against the
// deployment being replaced. Both health routes report the commit baked into
// their image, and this waits for that to change to the expected sha.

const POLL_INTERVAL_MS = 5_000
const ATTEMPTS = 120 // 10 minutes, well past the minute a swap takes

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`missing required environment variable: ${name}`)
  return value
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// POST, not GET. Coolify's auth middleware answers every method with 401
// before routing decides, so a GET's 405 never surfaces when probing by hand.
async function queueDeployment(webhook, token) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.text()
  if (!response.ok) {
    throw new Error(`coolify webhook failed with http ${response.status}: ${body.slice(0, 300)}`)
  }
  console.log(`coolify accepted the deployment: ${body.slice(0, 200)}`)
}

// null means "not yet": the replacement container refuses connections until it
// binds, and the proxy has no backend in between.
async function reportedCommit(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' })
    if (!response.ok) return null
    const body = await response.json()
    return typeof body.commit === 'string' ? body.commit : null
  } catch {
    return null
  }
}

async function waitForCommit(url, expected) {
  let lastSeen
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const commit = await reportedCommit(url)
    if (commit === expected) {
      console.log(`${url} is serving ${expected.slice(0, 8)}`)
      return
    }
    if (commit !== lastSeen) {
      console.log(
        `${url} is serving ${commit ?? 'nothing yet'}, waiting for ${expected.slice(0, 8)}`,
      )
      lastSeen = commit
    }
    await wait(POLL_INTERVAL_MS)
  }
  throw new Error(
    `${url} never reported ${expected}. last seen: ${lastSeen ?? 'no answer'}. ` +
      'check the coolify deployment log.',
  )
}

const webhook = new URL(required('COOLIFY_WEBHOOK_URL'))
const token = required('COOLIFY_TOKEN')
const expected = required('EXPECTED_COMMIT')
// The API first: web being up while the API is down tells you nothing.
const healthUrls = required('COOLIFY_HEALTH_URLS')
  .split(',')
  .map((value) => new URL(value.trim()))

await queueDeployment(webhook, token)
for (const url of healthUrls) await waitForCommit(url, expected)
console.log('deploy confirmed live')

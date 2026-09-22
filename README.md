# rungs

a writing game. you get one rule and write until it holds. then you get the next rule, and every earlier rule has to keep holding while you satisfy the new one. the rules don't warn you about each other, so the fun is in the rewrite that follows each new rule.

a set of rules is called a ladder. the game plays one ladder at a time, and the ladder is expected to change. nothing in the web app knows what the current one is about.

## tech stack

- a pnpm workspace run with turborepo, typescript throughout.
- `apps/api` is a [hono](https://hono.dev) server on node 22. it holds the ladder, scores drafts and is the only thing that talks to the model.
- `apps/web` is a [next.js](https://nextjs.org) app router app with tailwind v4 and motion. it calls the api through hono rpc, so the request and response types come straight from the api's routes.
- `tooling/` has the shared typescript and eslint config. eslint warns on files over 300 lines and errors over 800.
- there's no database and no accounts. a draft lives in the browser's localstorage, keyed by ladder id.

## how jev is used

[jev](https://typesafe.ai) is typesafe ai's classifier. you give it a text and a set of yes/no questions, and it returns a calibrated probability for each one. rungs calls it as `typesafe-ai/jev` through the vercel ai gateway, using the ai sdk's `experimental_evaluate`. the code is in `apps/api/src/jev.ts`.

some rules are judgement calls, like "this is written in the form of a eulogy" or "the writer is angry". those are meter rules. each one is a statement plus a threshold, and it holds when jev's probability is above or below the line. every live meter rule goes into a single call, so eight rules still cost one round trip. rules that are plain counting, like a word limit or a banned word, are checked locally and never reach jev.

the player never sees a probability. the web app gets a 0 to 1 closeness per rule and draws it as a bar that fills as the draft gets nearer to passing. scoring runs after a short pause in typing, not on every keystroke.

upcoming rules never leave the server. `POST /ladder/score` only returns the rules the player has unlocked, plus the next one once they all hold.

## running it locally

you need node 22.9 or later and pnpm 11.

```sh
pnpm install
pnpm dev
```

that starts the api on :3001 and the web app on :3000. the browser only ever talks to the web app, which forwards `/api/*` to the api.

the api needs an ai gateway key. its `dev` script reads it from `secret-run bookline vercel.ai_gateway`, so the key never touches disk. without secret-run, copy `apps/api/.env.example` to `apps/api/.env.local`, fill in `AI_GATEWAY_API_KEY` and start the api with `pnpm --filter @rungs/api dev:env`.

other tasks: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm format`. the tests use a fake judge and don't need a key.

## writing a ladder

a ladder is an id, a title and an ordered list of rules. the types are in `apps/api/src/ladder/rules.ts`. each rule has the `text` the player sees, a one-sentence `hint` that explains it, and one of three kinds:

- `meter` is a statement jev judges, held `above` or `below` a threshold.
- `forbid` is a list of banned word stems.
- `maxWords` is a word limit.

to swap the ladder, add a file next to the current one in `apps/api/src/ladder/` and point `LADDER` in `apps/api/src/ladder/index.ts` at it. the web app picks up the new title, rule count and rules on the next load. players start from a blank page because drafts are saved per ladder id. the link preview at `/opengraph-image` is drawn per request from the same title and rule count, so it changes with the ladder.

write meter statements about form, not fact. "this text is a eulogy" scored 0.96 on a normal draft and fell to 0.71 once the person who died turned out to be a router. "this text is written in the form of a eulogy" held through the joke.

to tune a threshold, run `pnpm --filter @rungs/api probe`. it scores candidate statements against a text that should pass and one that shouldn't. a good statement puts a wide gap between the two. set the threshold a little below what a real solution scores, so the rule can be beaten but still takes some effort.

## deploying

pushes to `main` deploy to a self-hosted coolify instance. nothing builds on the server:

1. `ci.yml` runs format, lint, typecheck, tests and build.
2. when ci passes on `main`, `release.yml` builds `Dockerfile.api` and `Dockerfile.web` and pushes them to ghcr as `rungs-api` and `rungs-web`, tagged `main` and `sha-<commit>`.
3. it then posts to coolify's deploy webhook. coolify pulls both images and restarts the stack described in `compose.yaml`.
4. `.github/scripts/deploy-coolify.mjs` waits until `/api/health` and `/health` report the new commit. the webhook returns before the old containers are replaced, so a 200 from either route proves nothing on its own.

only the web container has a domain. the api is reachable only inside the compose network, and the web app forwards `/api/*` to it.

the workflow reads the `COOLIFY_WEBHOOK_URL` and `COOLIFY_TOKEN` secrets and the `COOLIFY_HEALTH_URLS` variable. the only runtime secret is `AI_GATEWAY_API_KEY`, which is set in coolify. compose also sets `SITE_URL`, so link previews use absolute urls.

## license

[mit](LICENSE)

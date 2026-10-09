# rungs

a writing game. you get one rule and write until it holds. then you get the next rule, and every earlier rule has to keep holding while you satisfy the new one. the rules don't warn you about each other, so the fun is in the rewrite that follows each new rule.

a set of rules is called a ladder. there's a new one each day, and every past ladder stays playable. each ladder has an about page with an explanation, hints you reveal one at a time, and solutions other players have posted. playing never needs an account. posting a solution does, and signing in only takes an email and a code.

## tech stack

- a pnpm workspace run with turborepo, typescript throughout.
- `apps/api` is a [hono](https://hono.dev) server on node 22. it holds the ladders, scores drafts, owns the database and accounts, and is the only thing that talks to the model.
- postgres through [drizzle](https://orm.drizzle.team). the api applies migrations from `apps/api/drizzle/` on boot.
- accounts are [better-auth](https://better-auth.com) with its email otp plugin, and codes go out through [resend](https://resend.com).
- `apps/web` is a [next.js](https://nextjs.org) app router app with tailwind v4 and motion. it calls the api through hono rpc, so the request and response types come straight from the api's routes.
- `tooling/` has the shared typescript and eslint config. eslint warns on files over 450 lines and errors over 900.
- a draft in progress lives in the browser's localstorage, keyed by ladder id. the database only holds ladders, accounts and posted solutions.

## how jev is used

[jev](https://typesafe.ai) is typesafe ai's classifier. you give it a text and a set of yes/no questions, and it returns a calibrated probability for each one. rungs calls it as `~typesafe/jev-latest` through openrouter's decisions api, using the ai sdk's `experimental_evaluate` with `@openrouter/ai-sdk-provider`. the code is in `apps/api/src/jev.ts`.

some rules are judgement calls, like "this is written in the form of a eulogy" or "the writer is angry". those are meter rules. each one is a statement plus a threshold, and it holds when jev's probability is above or below the line. every live meter rule goes into a single call, so eight rules still cost one round trip. rules that are plain counting, like a word limit or a banned word, are checked locally and never reach jev.

the player never sees a probability. the web app gets a 0 to 1 closeness per rule and draws it as a bar that fills as the draft gets nearer to passing. scoring runs after a short pause in typing, not on every keystroke.

upcoming rules never leave the server. `POST /ladders/:id/score` only returns the rules the player has unlocked, plus the next one once they all hold. a ladder dated in the future returns 404 everywhere.

a posted solution is judged again on the server with every rule live, and it's saved only if it clears. the word count shown next to it is the server's.

## running it locally

you need node 22.9 or later and pnpm 11.

```sh
pnpm install
docker compose -f compose.dev.yaml up -d
pnpm dev
```

the compose file starts postgres on :5434. `pnpm dev` then starts the api on :3001 and the web app on :3000. the browser only ever talks to the web app, which forwards `/api/*` to the api.

the api needs an openrouter key. its `dev` script reads it from `secret-run personal rungs.openrouter`, so the key never touches disk. without secret-run, copy `apps/api/.env.example` to `apps/api/.env.local`, fill in `OPENROUTER_API_KEY` and start the api with `pnpm --filter @rungs/api dev:env`.

in dev, the database url and auth secret default to the compose postgres and a throwaway value. without a `RESEND_API_KEY`, sign-in codes are printed to the api's terminal.

other tasks: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm format`. the tests use a fake judge and don't need a key.

## writing a ladder

each ladder is a folder in `apps/api/ladders/<id>/`. `ladder.ts` exports an id, a title, the `date` it becomes the daily, a list of `hints` and an ordered list of rules. `explanation.mdx` next to it is the about page. the types are in `apps/api/src/ladder/rules.ts` and `file.ts`. each rule has the `text` the player sees, a one-sentence `hint` that explains it, and one of three kinds:

- `meter` is a statement jev judges, held `above` or `below` a threshold.
- `forbid` is a list of banned word stems.
- `maxWords` is a word limit.

to schedule one, add the folder and list it in `apps/api/ladders/index.ts`. on boot, the api validates every listed ladder and upserts it into the database. it goes live at midnight utc on its date and stays up until a later one takes over, so a day with nothing new keeps the last one. ladders dated in the future can be deployed early without leaking.

once a ladder has posted solutions, the sync won't change its rules, because that would quietly invalidate every post. the title, hints and explanation still update.

players start from a blank page on a new ladder because drafts are saved per ladder id. the link preview at `/opengraph-image` is drawn from today's title and rule count and redrawn at most every ten minutes. the build has no api to read, so for the first ten minutes after a deploy it shows the plain rungs card.

write meter statements about form, not fact. "this text is a eulogy" scored 0.96 on a normal draft and fell to 0.71 once the person who died turned out to be a router. "this text is written in the form of a eulogy" held through the joke.

to tune a threshold, run `pnpm --filter @rungs/api probe`. it scores candidate statements against a text that should pass and one that shouldn't. a good statement puts a wide gap between the two. set the threshold a little below what a real solution scores, so the rule can be beaten but still takes some effort.

## deploying

pushes to `main` deploy to a self-hosted coolify instance. nothing builds on the server:

1. `ci.yml` runs format, lint, typecheck, tests and build.
2. when ci passes on `main`, `release.yml` builds `Dockerfile.api` and `Dockerfile.web` and pushes them to ghcr as `rungs-api` and `rungs-web`, tagged `main` and `sha-<commit>`.
3. it then posts to coolify's deploy webhook. coolify pulls both images and restarts the stack described in `compose.yaml`.
4. `.github/scripts/deploy-coolify.mjs` waits until `/api/health` and `/health` report the new commit. the webhook returns before the old containers are replaced, so a 200 from either route proves nothing on its own.

only the web container has a domain. the api is reachable only inside the compose network, and the web app forwards `/api/*` to it.

the workflow reads the `COOLIFY_WEBHOOK_URL` and `COOLIFY_TOKEN` secrets and the `COOLIFY_HEALTH_URLS` variable. the runtime secrets are set in coolify: `OPENROUTER_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET` and `RESEND_API_KEY`, plus `EMAIL_FROM` if the default sender doesn't suit. the database is a `rungs` database with its own `rungs` role on postgres-general, the shared coolify postgres. the api joins the `coolify` docker network to reach it by container name, so it's never exposed through the stack. compose also sets `SITE_URL`, so link previews use absolute urls.

## license

[mit](LICENSE)

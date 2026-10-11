# rungs

a writing game. you get one rule and write until it holds. then you get the next rule, and every earlier rule has to keep holding while you satisfy the new one. the rules don't warn you about each other, so the fun is in the rewrite that follows each new rule.

a set of rules is called a ladder. the home page lists every ladder that's out, plus blurred cards for the ones that come out later. each ladder has an about page with hints you reveal one at a time, then an explanation and the solutions other players have posted. `/solutions` shows the newest posts across every ladder, and each post has its own page at `/solutions/<id>` to link to. the explanation and the solutions give a ladder away, so for a ladder you haven't cleared they stay blurred until you say yes, and you can turn that check off for every ladder.

playing never needs an account. posting a solution, with an optional one-line comment, does, and signing in only takes an email and a code.

## tech stack

- a pnpm workspace run with turborepo, typescript throughout.
- `apps/api` is a [hono](https://hono.dev) server on node 22. it holds the ladders, scores drafts, owns the database and accounts, and is the only thing that talks to the model.
- postgres through [drizzle](https://orm.drizzle.team). the api applies migrations from `apps/api/drizzle/` on boot.
- accounts are [better-auth](https://better-auth.com) with its email otp and anonymous plugins, and codes go out through [resend](https://resend.com).
- `apps/web` is a [next.js](https://nextjs.org) app router app with tailwind v4 and motion. it calls the api through hono rpc, so the request and response types come straight from the api's routes.
- `tooling/` has the shared typescript and eslint config. eslint warns on files over 450 lines and errors over 900.
- progress (the draft, how many rules are unlocked and the best clear) lives in the database, one row per player per ladder. a player who hasn't signed in gets an anonymous account the first time a draft is judged, and signing in moves its progress to the real account. where both played the same ladder, the newer draft and the lower best win. anonymous accounts are deleted once they've gone 90 days without a visit.

## how jev is used

[jev](https://typesafe.ai) is typesafe ai's classifier. you give it a text and a set of yes/no questions, and it returns a calibrated probability for each one. rungs calls it as `~typesafe/jev-latest` through openrouter's decisions api, using the ai sdk's `experimental_evaluate` with `@openrouter/ai-sdk-provider`. the code is in `apps/api/src/jev.ts`.

some rules are judgement calls, like "this is written in the form of a eulogy" or "the writer is angry". those are meter rules. each one is a statement plus a threshold, and it holds when jev's probability is above or below the line. every live meter rule goes into a single call, so eight rules still cost one round trip. rules that are plain counting, like a word limit or a banned word, are checked locally and never reach jev. a word is a run of letters and numbers, so a blank that isn't a space can't glue a post into one word, and invisible characters are stripped before the banned-word check.

every call is paid. once a day's budget of statements across every visitor is spent, the api stops judging until midnight utc, so a flood of requests can't run through the key's whole spending limit. size the `dailyBudget` in `apps/api/src/jev.ts` to a day's share of that limit. a call that takes longer than 10 seconds is dropped and retried once.

the player never sees a probability. the web app gets a 0 to 1 closeness per rule and draws it as a bar that fills as the draft gets nearer to passing. scoring runs after a short pause in typing, not on every keystroke.

while you play, upcoming rules never leave the server. `POST /ladders/:id/score` only returns the rules the player has unlocked, plus the next one once they all hold. the about page's explanation and the posted solutions do give a ladder away, and the web app keeps them blurred until the player says yes. a ladder dated in the future returns 404 everywhere.

the score route saves the draft every time it judges one. it also decides how many rules are unlocked: the client can ask for fewer (starting over) but never more than the judge has revealed, so rule text can't be fished out early.

a posted solution is judged again on the server with every rule live, and it's saved only if it clears. the word count shown next to it is the server's. comments are one line of plain text, up to 280 characters, with no links.

## running it locally

you need node 22.9 or later and pnpm 11.

```sh
pnpm install
docker compose -f compose.dev.yaml up -d
pnpm dev
```

the compose file starts postgres on :5434. `pnpm dev` then starts the api on :3001 and the web app on :3000. the browser only ever talks to the web app, which forwards `/api/*` to the api.

the api needs an openrouter key. copy `apps/api/.env.example` to `apps/api/.env.local` and fill in `OPENROUTER_API_KEY`, or set it in the environment, which wins over the file.

in dev, the database url and auth secret default to the compose postgres and a throwaway value. without a `RESEND_API_KEY`, sign-in codes are printed to the api's terminal.

other tasks: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm format`. the tests use a fake judge and don't need a key. one of them runs the score route against a real postgres, applying every migration first, and it's skipped unless `DATABASE_URL` is set. ci sets it. to run it locally, `DATABASE_URL=postgres://rungs:rungs@localhost:5434/rungs pnpm test`.

## writing a ladder

each ladder is a folder in `apps/api/ladders/<id>/`. `ladder.ts` exports an id, a title, the `date` it comes out, a list of `hints` and an ordered list of rules. `explanation.mdx` next to it is the about page. the types are in `apps/api/src/ladder/rules.ts` and `file.ts`. each rule has the `text` the player sees, a one-sentence `hint` that explains it, and one of three kinds:

- `meter` is a statement jev judges, held `above` or `below` a threshold.
- `forbid` is a list of banned word stems.
- `maxWords` is a word limit.

to publish one, add the folder and list it in `apps/api/ladders/index.ts`. `pnpm test` checks every listed ladder against the same schema the api uses on boot. on boot, the api validates every listed ladder and upserts it into the database. it comes out at midnight utc on its date and stays playable after that. several ladders can share a date. the home page lists them newest first, and ladders sharing a date appear in their order in `index.ts`. a ladder dated in the future can be deployed early: until its date, the home page shows only that date and its rule count.

once a ladder has posted solutions, the sync won't change its rules, because that would quietly invalidate every post. the title, hints and explanation still update.

each ladder has its own link preview at `/ladders/<id>/opengraph-image`, its title over rule 1, and its about page uses the same one. a post's preview shows the ladder, who posted it and its length, never the text. every other page gets the plain rungs card at `/opengraph-image`. `/sitemap.xml` lists the home page, `/solutions`, both pages of every ladder that's out and every post's page.

the hints, the explanation, the solutions and the first page of `/solutions` render on the server, so they're in the html a crawler fetches. spoilers stay blurred in the browser until the player says yes, but the text is still in the page.

write meter statements about form, not fact. "this text is a eulogy" scored 0.96 on a normal draft and fell to 0.71 once the person who died turned out to be a router. "this text is written in the form of a eulogy" held through the joke.

to tune a threshold, run `pnpm --filter @rungs/api probe`. it scores candidate statements against a text that should pass and one that shouldn't. a good statement puts a wide gap between the two. set the threshold a little below what a real solution scores, so the rule can be beaten but still takes some effort.

## deploying

pushes to `main` deploy to a self-hosted coolify instance. nothing builds on the server:

1. `ci.yml` runs format, lint, typecheck, tests and build.
2. when ci passes on `main`, `release.yml` builds `Dockerfile.api` and `Dockerfile.web` and pushes them to ghcr as `rungs-api` and `rungs-web`, tagged `main` and `sha-<commit>`.
3. it then posts to coolify's deploy webhook. coolify pulls both images and restarts the stack. it runs its own copy of `compose.yaml`, so a change to that file, or a new environment variable, has to be made in coolify before the change that needs it merges. when a variable is renamed, keep the old name set until the new image is live.
4. `.github/scripts/deploy-coolify.mjs` waits until `/api/health` and `/health` report the new commit. the webhook returns before the old containers are replaced, so a 200 from either route proves nothing on its own.

only the web container has a domain. the api is reachable only inside the compose network, and the web app forwards `/api/*` to it.

the workflow reads the `COOLIFY_WEBHOOK_URL` and `COOLIFY_TOKEN` secrets and the `COOLIFY_HEALTH_URLS` variable. the runtime secrets are set in coolify: `OPENROUTER_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY` and `EMAIL_FROM`, the sender for sign-in codes, which the api requires whenever there's a resend key. the database is a postgres on the `coolify` docker network, which the api joins, so the database is never exposed through the stack. `SITE_URL` is set in compose for the api, which won't start in production without it, since sign-in only trusts that origin. the web image bakes it in at build time from the `SITE_URL` repo variable, since prerendered pages and `robots.txt` are built then, and the build stops without it. that keeps link previews, `robots.txt` and the sitemap on absolute urls.

### analytics

page views and a few events go to a self-hosted [umami](https://umami.is) through `/_a`, which the web app forwards to the umami host. umami sets no cookies. the events are rules unlocked, ladders cleared, solutions posted, hints and spoilers shown, shares, sign-ins, start-overs and judge errors, each with the ladder id and a number or two. draft text, names and emails are never sent.

it's on only when the web build has `NEXT_PUBLIC_UMAMI_HOST` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. without them there's no script and nothing is sent. the release workflow passes both from the `UMAMI_HOST` and `UMAMI_WEBSITE_ID` repo variables. only the domain in `SITE_URL` reports, so a local build sends nothing.

### taking a post down

only the player who posted something can delete it from the app. to remove an abusive post or name, run one of these against the `rungs` database:

```sql
delete from solutions where id = 123;                     -- the number in /solutions/123
update "user" set name = 'player' where name = 'the name';
```

## license

[mit](LICENSE). the geist fonts in `apps/web/assets/`, used for the link previews, are under the [sil open font license](apps/web/assets/OFL.txt).

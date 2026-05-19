# AGENTS.md — rules for building a game in this repo

You are iterating on a game that ships to `speedrungames.net/games/<slug>/`. This repo is its own Netlify site. Push to `main` → live.

## Hard rules

1. **Relative asset URLs only.** `./assets/foo.png`, never `/assets/foo.png`. The game is served under `/games/<slug>/` on the live site; absolute paths break.
2. **`index.html` is the entrypoint.** Either hand-written at the repo root, or emitted by your build to the directory specified as `publish` in `netlify.toml`.
3. **Do not touch `netlify.toml` casually.** If you add a build step, uncomment the two lines provided — don't restructure.
4. **No secrets in the repo.** This site is public. Anything in the bundle ships to every player.
5. **Self-contained.** No dependencies on external CDNs unless you accept they may disappear. Vendor what you use.
6. **Test it under the iframe-like mount before declaring done.** Easiest check: open `index.html` from `file://` — if assets load there, relative paths are correct.

## Workflow

- Make changes on a feature branch, open a PR, merge to `main`. Netlify deploys on push to `main`.
- The deploy preview URL on each PR is the same game served from a Netlify preview site — open it in the iframe of a speedrungames preview to test the full experience.

## What you may NOT do without explicit approval

- Rename the repo (the proxy rule on `speedrungames` points at `https://<repo-name>.netlify.app`).
- Change the slug used in the speedrungames registry.
- Delete or rename `netlify.toml`.

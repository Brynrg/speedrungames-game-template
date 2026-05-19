# speedrungames-game-template

Template repo for games that ship on [speedrungames.net](https://speedrungames.net).

## Quickstart

```bash
gh repo create Brynrg/game-<slug> --public --template Brynrg/speedrungames-game-template --clone
cd game-<slug>
# edit index.html, push.
```

1. **Connect to Netlify** (one-time): netlify.com → "Add new site" → "Import an existing project" → pick your new repo. No config needed — `netlify.toml` covers it.
2. **Note the Netlify URL** (e.g. `https://game-<slug>.netlify.app`).
3. **Register on speedrungames.net**: in `Brynrg/speedrungames`, add one entry to `apps/web/src/lib/games.ts` (see that repo's `AGENTS.md`). Merge → live.

After that, every push to this repo's `main` updates the live game on speedrungames.net automatically. No syncing, no umbrella-repo commits.

## Hard rules for the build

All asset URLs in your HTML/CSS/JS must be **relative** (`./assets/foo.png`, not `/assets/foo.png`). When proxied under `speedrungames.net/games/<slug>/`, absolute root paths break.

If using a bundler, set the base path:

| Tool | Setting |
|---|---|
| Vite | `base: "./"` in `vite.config.ts` |
| Webpack | `output.publicPath = "./"` |
| Parcel | `--public-url ./` |
| Next.js | Don't. Use a static export only, or skip Next entirely for games. |

## Local dev

For a hand-written game, just open `index.html` in a browser, or run any static server:

```bash
npx serve .
```

For a bundler-based game, use that tool's dev command (`vite`, `npm run dev`, etc.).

## See also

- Umbrella repo: [Brynrg/speedrungames](https://github.com/Brynrg/speedrungames)
- Full agent playbook: [Brynrg/speedrungames/AGENTS.md](https://github.com/Brynrg/speedrungames/blob/main/AGENTS.md)

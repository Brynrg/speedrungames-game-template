# AGENTS.md — building a game in this repo

You are iterating on a game that ships to `speedrungames.net/games/<slug>/`. This repo is its own Netlify site. Push to `main` → live.

## What you start with

A Vite + TypeScript scaffold that consumes [speedrungames-sdk](https://github.com/Brynrg/speedrungames-sdk) for all the speedrun-specific runtime. Layout:

| File | Role |
|---|---|
| `src/main.ts` | Entry. Wires canvas + game loop + timer + HUD + PB storage + leaderboard. **This is where you write your game.** |
| `src/styles.css` | Theme variables + canvas styles. HUD styles are inlined by the SDK. |
| `index.html` | Vite entrypoint. Don't add `<script>`s here — import from `main.ts`. |
| `speedrungames.json` | Manifest read by the umbrella for auto-discovery. **Update `slug`, `title`, `description`, `emoji`.** |
| `vite.config.ts` | Vite config. **`base: "./"` is load-bearing** — do not remove. |
| `netlify.toml` | Netlify build config. Defaults to `npm run build` → `dist/`. |
| `.github/workflows/ci.yml` | Auto-runs on every PR: typecheck, build, relative-path lint. |

The SDK (`speedrungames-sdk`) provides:

| Module | Imports |
|---|---|
| `speedrungames-sdk/timer` | `SpeedrunTimer`, `formatTime`, types `Split`, `TimerState` |
| `speedrungames-sdk/storage` | `createStorage(slug)` → `{getPB, maybeSavePB, clearPB}` |
| `speedrungames-sdk/hud` | `createHUD(parent)` → `{setTime, setPB, setStatus, destroy}` |
| `speedrungames-sdk/game` | `Game` (canvas + rAF loop with dt) |
| `speedrungames-sdk/leaderboard` | `submitRun({slug, ms, splits})`, `fetchRuns({slug?, limit?})` |

## Mandatory edits before shipping

1. **`src/main.ts`** — replace `SLUG = "REPLACE_ME"` with your slug. Replace the gameplay section (between `─── Gameplay` comments) with your game.
2. **`speedrungames.json`** — replace every `REPLACE_ME` with real values. `deployUrl` is normally `https://game-<slug>.netlify.app` (your Netlify site URL).
3. **`index.html`** — update the `<title>`.

## Hard rules

1. **Relative asset URLs only.** Source: `./assets/foo.png`. CSS: `url(./foo.png)`. Vite handles import paths; just don't write absolute `/...` paths in HTML/CSS.
2. **Don't remove `base: "./"`** from `vite.config.ts`. The CI lint catches it, but it's the #1 thing that breaks the speedrungames.net proxy.
3. **Keep CI green** — typecheck, build, path lint must pass.
4. **No secrets in the repo.** Site is public; bundle ships to every player.
5. **Self-contained.** Vendor what you use. No external CDNs without a fallback.
6. **Use the SDK.** Don't reinvent timer/storage/HUD. If the SDK is missing something, open a PR against [Brynrg/speedrungames-sdk](https://github.com/Brynrg/speedrungames-sdk) rather than inlining it here.

## Common tasks

| Task | How |
|---|---|
| Run locally | `npm install` then `npm run dev` → http://localhost:5173 |
| Production build | `npm run build` (output: `dist/`) |
| Preview production build | `npm run preview` |
| Typecheck | `npm run typecheck` |
| Run path lint locally | `npm run build && npm run lint:paths` |
| Update SDK | bump the version in `package.json`: `"speedrungames-sdk": "github:Brynrg/speedrungames-sdk#vX.Y.Z"` |

## SDK API quick reference

```ts
// Timer
import { SpeedrunTimer, formatTime } from "speedrungames-sdk/timer";
const timer = new SpeedrunTimer();
timer.start();
timer.split("checkpoint-1");
timer.pause(); timer.resume();
const ms = timer.finish();
timer.subscribe((ms, state) => {});
formatTime(ms); // "01:23.456"

// PB persistence
import { createStorage } from "speedrungames-sdk/storage";
const storage = createStorage("my-slug");
const pb = storage.getPB();
const isPB = storage.maybeSavePB({ ms: 12345, achievedAt: Date.now() });

// Leaderboard
import { submitRun, fetchRuns } from "speedrungames-sdk/leaderboard";
await submitRun({ slug: "my-slug", ms: 12345, splits });
const runs = await fetchRuns({ slug: "my-slug", limit: 10 });
```

## Done checklist

- [ ] `SLUG` updated in `src/main.ts`
- [ ] All `REPLACE_ME`s replaced in `speedrungames.json`
- [ ] Page title updated in `index.html`
- [ ] Gameplay section in `src/main.ts` replaced
- [ ] `npm run build && npm run lint:paths` passes locally
- [ ] CI green on the PR
- [ ] Game's own Netlify deploy preview loads + plays correctly
- [ ] Speedrungames PR opened (or auto-discovery kicked in)

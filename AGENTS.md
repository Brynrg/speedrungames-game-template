# AGENTS.md — building a game in this repo

You are iterating on a game that ships to `speedrungames.net/games/<slug>/`. This repo is its own Netlify site. Push to `main` → live.

## What you start with

A Vite + TypeScript scaffold with these pieces already wired:

| File | Role |
|---|---|
| `src/main.ts` | Entry. Wires canvas, game loop, timer, HUD, PB storage. **This is where you write your game.** |
| `src/game.ts` | `Game` class — canvas + `requestAnimationFrame` loop with dt, DPR-aware resize. |
| `src/speedrun.ts` | `SpeedrunTimer` class — ms-precision timer with start/pause/resume/split/finish, plus `formatTime(ms)`. |
| `src/storage.ts` | PB persistence in `localStorage`. **You MUST change `SLUG` to your slug** (it namespaces the key). |
| `src/ui.ts` | HUD overlay (time, PB, status text). |
| `src/styles.css` | Theme variables + HUD/canvas styles. |
| `index.html` | Vite entrypoint. Don't add `<script>`s here — import from `main.ts`. |
| `vite.config.ts` | Vite config. **`base: "./"` is load-bearing** — do not remove. |
| `netlify.toml` | Netlify build config. Defaults to `npm run build` → `dist/`. |
| `.github/workflows/ci.yml` | Auto-runs on every PR: typecheck, build, relative-path lint. |

The template deploys to a playable demo (click N targets) on day one. To build your game, replace the `// ─── Gameplay (replace this section) ───` block in `src/main.ts`.

## Hard rules

1. **Change `SLUG` in `src/storage.ts`** to your slug before doing anything else. Otherwise every game on the template shares a localStorage key.
2. **Relative asset URLs only.** Source: `./assets/foo.png`. CSS: `url(./foo.png)`. Vite handles import paths automatically; just don't write absolute `/...` paths in HTML/CSS.
3. **Don't remove `base: "./"`** from `vite.config.ts`. The CI lint catches violations, but losing this setting is the #1 way a game breaks under the speedrungames.net proxy.
4. **Keep CI green.** PRs that fail typecheck, build, or path lint should not merge.
5. **No secrets in the repo.** Site is public; bundle ships to every player.
6. **Self-contained.** Vendor what you use. No external CDNs without a fallback.

## Common tasks

| Task | How |
|---|---|
| Run locally | `npm install` (first time) then `npm run dev` → http://localhost:5173 |
| Production build | `npm run build` (output: `dist/`) |
| Preview production build | `npm run preview` |
| Typecheck | `npm run typecheck` |
| Run path lint locally | `npm run build && npm run lint:paths` |

## Timer API quick reference

```ts
import { SpeedrunTimer, formatTime } from "./speedrun.ts";
const timer = new SpeedrunTimer();
timer.start();                        // begin
timer.split("checkpoint-1");          // record a split
timer.pause(); timer.resume();        // pause/resume
const ms = timer.finish();            // stop, return final ms
timer.reset();                        // back to idle
timer.elapsed();                      // current ms
timer.getSplits();                    // readonly array
timer.subscribe((ms, state) => {});   // ms ticks at rAF cadence
formatTime(ms);                       // "01:23.456"
```

## PB API quick reference

```ts
import { getPB, maybeSavePB, clearPB } from "./storage.ts";
const pb = getPB();                                            // PersonalBest | null
const isNewPB = maybeSavePB({ ms: 12345, achievedAt: Date.now() });
clearPB();
```

`maybeSavePB` only writes if the new time beats the existing PB. It returns `true` when it does — handy for triggering a "New PB!" effect.

## What you may NOT do without explicit approval

- Rename the repo. The proxy rule on `speedrungames` points at `https://<repo-name>.netlify.app`.
- Change the slug used in the speedrungames registry.
- Delete or rename `netlify.toml`, `vite.config.ts`, or `tsconfig.json`.
- Disable the CI workflow.

## Done checklist

- [ ] Replaced gameplay section in `src/main.ts`
- [ ] Updated `SLUG` in `src/storage.ts`
- [ ] Page title updated in `index.html`
- [ ] `npm run build && npm run lint:paths` passes locally
- [ ] CI green on the PR
- [ ] Game's own Netlify deploy preview loads + plays correctly
- [ ] Speedrungames registry entry added (in the umbrella repo)

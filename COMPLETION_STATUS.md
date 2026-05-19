# Completion Status

> Status doc for AI agents working on this repo. Updated 2026-05-19.

**Score:** 72 / 100 — Solid scaffold, missing REPLACE_ME guard + lint config
**State:** Active. Used as a `gh repo create --template` source.
**Stack:** Vite 5 + TypeScript 5, consumes `speedrungames-sdk#v0.1.0`

## What works
- Playable 5-target click demo ships day-one to Netlify
- AGENTS.md is a strong build playbook (mandatory edits, hard rules, per-module SDK API quick reference)
- `speedrungames.json` manifest powers umbrella auto-discovery
- `scripts/check-relative-paths.mjs` enforces `base: "./"` (required by the umbrella proxy)
- CI: typecheck + build + path lint

## Known gaps
- `REPLACE_ME` sentinel in `src/main.ts` and `speedrungames.json` is only **runtime-checked** — a forgetful agent can ship a game with `slug: "REPLACE_ME"`
- No eslint/prettier config — style drift between forked games is guaranteed
- The "plain-static, no bundler" path in the README bypasses both the SDK and the path lint — footgun
- README still mentions manually editing `apps/web/src/lib/games.data.json` in the umbrella, but the umbrella now has `discover-games.mjs`

## Priority improvements
1. **Add CI check** that fails if `SLUG === "REPLACE_ME"` or `speedrungames.json` contains "REPLACE_ME" — pair with the existing `check-relative-paths.mjs`
2. Add minimal `eslint` + `prettier` config so all template-spawned games share style
3. Reconcile README with umbrella's auto-discovery — remove manual `games.data.json` edit instruction
4. Either remove the "plain-static" alternative path or formalize it as a second template

## Notes for AI agents
- This template pins `speedrungames-sdk#v0.1.0`. When the SDK tags a new version, bump the pin here.
- Forking workflow: `gh repo create --template Brynrg/speedrungames-game-template <new-game-slug>`
- After fork, AI agents **must** edit AGENTS.md's "mandatory edits" — replace REPLACE_ME in `src/main.ts`, `speedrungames.json`, and metadata
- **Related repos**: `speedrungames` (umbrella), `speedrungames-sdk` (runtime)

## Description

Please include a summary of the changes and the related issue. Please also include relevant motivation and context.

## Checklist (From AGENTS.md)

Before submitting this PR, please check that you have completed the following:

- [ ] Updated `game.manifest.json` (slug, title, description, framework).
- [ ] Updated `src/main.ts` with correct `const SLUG` and replaced gameplay section.
- [ ] Updated `index.html` with correct `<title>`.
- [ ] Verified that all asset URLs are relative (e.g. `./assets/foo.png`).
- [ ] Ensured `base: "./"` is present in `vite.config.ts`.
- [ ] Ensured CI is green locally (typecheck, build, path lint, smoke tests pass).
- [ ] Ensured there are no secrets in the repo.
- [ ] Verified that this branch is not trying to deploy by hand (Wait for push to `main`).

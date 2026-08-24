import fs from "node:fs";
import { resolve } from "node:path";

export function resolvePortal(p, repoPath) {
  const candidates = [p, resolve(repoPath, "..", "speedrungames")].filter(Boolean);
  for (const c of candidates) {
    if (c && fs.existsSync(resolve(c, "scripts/ingest-game-build.mjs"))) return resolve(c);
  }
  return null;
}

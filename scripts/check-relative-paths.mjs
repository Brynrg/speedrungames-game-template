#!/usr/bin/env node
// Verifies the built dist/ uses only relative asset paths.
//
// Why this exists: speedrungames.net proxies your game under
// /games/<slug>/. Any built file referencing /assets/foo.js would
// be resolved against speedrungames.net root, not the proxy mount,
// and would 404. This script catches that before deploy.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST = "dist";
const SCAN_EXT = /\.(html|css|js|mjs|cjs)$/;
const ATTR_RE = /(?:src|href)\s*=\s*["']\/(?!\/)([^"']*)/g;
const CSS_URL_RE = /url\(\s*["']?\/(?!\/)([^"')]*)/g;

const offenders = [];

async function walk(dir) {
  const entries = await readdir(dir);
  const tasks = entries.map(async (entry) => {
    const p = join(dir, entry);
    const st = await stat(p);
    if (st.isDirectory()) {
      await walk(p);
      return;
    }
    if (!SCAN_EXT.test(entry)) return;
    const content = await readFile(p, "utf8");
    for (const m of content.matchAll(ATTR_RE)) {
      offenders.push({ file: p, path: "/" + m[1] });
    }
    for (const m of content.matchAll(CSS_URL_RE)) {
      offenders.push({ file: p, path: "/" + m[1] });
    }
  });
  await Promise.all(tasks);
}

try {
  await walk(DIST);
} catch (err) {
  console.error(
    `check-relative-paths: could not scan ${DIST}/. Run \`npm run build\` first.\n  ${err.message}`,
  );
  process.exit(2);
}

if (offenders.length > 0) {
  console.error(
    `\n✗ Found ${offenders.length} absolute path${offenders.length === 1 ? "" : "s"} in ${DIST}/.`,
  );
  console.error(
    `  These will break when the game is proxied under /games/<slug>/.\n`,
  );
  for (const o of offenders) {
    console.error(`  ${relative(process.cwd(), o.file)} → ${o.path}`);
  }
  console.error(
    `\nFix: use relative paths in your source (./assets/foo.png), and confirm vite.config.ts has \`base: "./"\`.\n`,
  );
  process.exit(1);
}

console.log("✓ check-relative-paths: no absolute paths in dist/");

#!/usr/bin/env node
// Fails if any tracked file still contains the template marker REPLACE_ME.
//
// Why this exists: the template's mandatory-edit contract (AGENTS.md §"first
// steps") requires forks to fill in slug/title/etc. before shipping. A fork
// that skips those edits would deploy a broken manifest to the portal. CI
// rejects it here instead.
//
// Allowed: docs that *describe* the marker, and this script.

import { execFileSync } from "node:child_process";

const MARKER = "REPLACE" + "_ME"; // split so this file never matches itself
const ALLOW = new Set([
  "AGENTS.md",
  "README.md",
  "IMPROVEMENT_PLAN.md",
  "COMPLETION_STATUS.md",
  "scripts/check-no-replace-me.mjs",
]);

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const offenders = [];
for (const file of tracked) {
  if (ALLOW.has(file)) continue;
  let text;
  try {
    text = execFileSync("git", ["show", `:${file}`], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch {
    continue; // binary or unreadable — git show on binary still returns; skip on error
  }
  if (text.includes(MARKER)) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(MARKER)) offenders.push(`${file}:${i + 1}`);
    }
  }
}

if (offenders.length) {
  console.error(
    `Found ${MARKER} in tracked files — complete the template's mandatory edits:`,
  );
  for (const o of offenders) console.error(`  ${o}`);
  process.exit(1);
}
console.log(`OK: no ${MARKER} markers in tracked files.`);

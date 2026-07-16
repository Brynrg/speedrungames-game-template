import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(REPO, "scripts/deploy-portal.mjs");

test("fails if dist/index.html is missing", () => {
  const tmp = mkdtempSync(join(tmpdir(), "deploy-portal-test-"));

  try {
    // Setup isolated repo structure in tmp
    const scriptsDir = join(tmp, "scripts");
    mkdirSync(scriptsDir);
    copyFileSync(SCRIPT, join(scriptsDir, "deploy-portal.mjs"));

    // Setup dummy portal to pass the portal check
    const portalDir = join(tmp, "speedrungames");
    mkdirSync(join(portalDir, "scripts"), { recursive: true });
    // just touch the ingest script
    copyFileSync(SCRIPT, join(portalDir, "scripts/ingest-game-build.mjs"));

    let error;
    try {
      execFileSync("node", [join(scriptsDir, "deploy-portal.mjs"), "--portal", portalDir], {
        cwd: tmp,
        stdio: "pipe",
        encoding: "utf-8",
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("No dist/index.html — run `npm run build` first.");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

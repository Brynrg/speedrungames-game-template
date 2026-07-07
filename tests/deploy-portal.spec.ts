import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_REPO = join(__dirname, "..");
const SCRIPT = join(REAL_REPO, "scripts/deploy-portal.mjs");

test.describe("deploy-portal.mjs", () => {
  let tmpPortal: string;
  let tmpRepo: string;

  test.beforeEach(() => {
    tmpRepo = mkdtempSync(join(tmpdir(), "repo-"));
    mkdirSync(join(tmpRepo, "dist"));
    writeFileSync(join(tmpRepo, "dist/index.html"), "fake index");

    tmpPortal = mkdtempSync(join(tmpdir(), "portal-"));
    mkdirSync(join(tmpPortal, "scripts"));
    writeFileSync(join(tmpPortal, "scripts/ingest-game-build.mjs"), "console.log('fake ingest');");
  });

  test.afterEach(() => {
    if (tmpRepo) {
      rmSync(tmpRepo, { recursive: true, force: true });
    }
    if (tmpPortal) {
      rmSync(tmpPortal, { recursive: true, force: true });
    }
  });

  test("fails if portal not found", () => {
    try {
      execFileSync("node", [SCRIPT], { encoding: "utf8", stdio: "pipe", env: { ...process.env, REPO_DIR: tmpRepo, SPEEDRUNGAMES_PORTAL: "" } });
      test.fail(true, "Should have thrown");
    } catch (err: any) {
      expect(err.stderr).toContain("Could not find a speedrungames portal checkout.");
    }
  });

  test("runs successfully with --portal", () => {
    const output = execFileSync("node", [SCRIPT, "--portal", tmpPortal], { encoding: "utf8", env: { ...process.env, REPO_DIR: tmpRepo, SPEEDRUNGAMES_PORTAL: "" } });
    expect(output).toContain("→ Ingesting this game into");
    expect(output).toContain("✓ Ingested.");
  });

  test("fails if ingest-game-build.mjs is missing", () => {
    rmSync(join(tmpPortal, "scripts/ingest-game-build.mjs"));
    try {
      execFileSync("node", [SCRIPT, "--portal", tmpPortal], { encoding: "utf8", stdio: "pipe", env: { ...process.env, REPO_DIR: tmpRepo, SPEEDRUNGAMES_PORTAL: "" } });
      test.fail(true, "Should have thrown");
    } catch (err: any) {
      expect(err.stderr).toContain("Could not find a speedrungames portal checkout");
    }
  });

  test("fails if dist/index.html is missing", () => {
    rmSync(join(tmpRepo, "dist/index.html"));
    try {
      execFileSync("node", [SCRIPT, "--portal", tmpPortal], { encoding: "utf8", stdio: "pipe", env: { ...process.env, REPO_DIR: tmpRepo, SPEEDRUNGAMES_PORTAL: "" } });
      test.fail(true, "Should have thrown");
    } catch (err: any) {
      expect(err.stderr).toContain("No dist/index.html");
    }
  });
});

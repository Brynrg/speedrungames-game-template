import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test.describe("deploy-portal.mjs", () => {
  let tmpDir: string;

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "deploy-portal-test-"));
    // Create scripts directory in tmpDir
    mkdirSync(join(tmpDir, "scripts"));
    // Copy the script
    cpSync("scripts/deploy-portal.mjs", join(tmpDir, "scripts/deploy-portal.mjs"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("fails when portal is not found", () => {
    let error: any;
    try {
      execFileSync("node", [join(tmpDir, "scripts/deploy-portal.mjs")], {
        env: { ...process.env, SPEEDRUNGAMES_PORTAL: "" },
        stdio: "pipe",
        encoding: "utf8"
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("Could not find a speedrungames portal checkout.");
  });
});

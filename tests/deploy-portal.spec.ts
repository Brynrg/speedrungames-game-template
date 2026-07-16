import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(__dirname, "..", "scripts", "deploy-portal.mjs");

test.describe("deploy-portal.mjs", () => {
  let tmpRepo: string;

  test.beforeEach(() => {
    tmpRepo = mkdtempSync(join(tmpdir(), "deploy-test-"));
    const tmpScripts = join(tmpRepo, "scripts");
    mkdirSync(tmpScripts, { recursive: true });
    cpSync(SCRIPT_PATH, join(tmpScripts, "deploy-portal.mjs"));
  });

  test.afterEach(() => {
    rmSync(tmpRepo, { recursive: true, force: true });
  });

  test("fails when speedrungames portal checkout is missing", () => {
    const tmpScriptPath = join(tmpRepo, "scripts", "deploy-portal.mjs");
    let error: any;

    try {
      execFileSync("node", [tmpScriptPath], {
        encoding: "utf-8",
        env: { ...process.env, SPEEDRUNGAMES_PORTAL: "" },
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("Could not find a speedrungames portal checkout.");
  });
});

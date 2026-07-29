import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

test.describe("check-relative-paths.mjs", () => {
  let tmpDir: string;
  const scriptPath = resolve("scripts/check-relative-paths.mjs");

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("should fail with exit code 2 if dist directory is missing", () => {
    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("could not scan dist/");
    expect(error.stderr).toContain("Run `npm run build` first.");
  });
});

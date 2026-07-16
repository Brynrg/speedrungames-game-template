import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

test.describe("check-relative-paths", () => {
  test("fails when dist directory does not exist", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "test-"));
    const scriptPath = resolve("scripts/check-relative-paths.mjs");

    try {
      let err: any;
      try {
        execFileSync("node", [scriptPath], { cwd: tempDir, encoding: "utf8", stdio: "pipe" });
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.status).toBe(2);
      expect(err.stderr).toContain("check-relative-paths: could not scan dist/. Run `npm run build` first.");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

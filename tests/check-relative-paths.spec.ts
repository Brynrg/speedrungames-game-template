import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test.describe("check-relative-paths", () => {
  let tmpDir: string;
  let scriptPath: string;

  test.beforeAll(() => {
    scriptPath = join(process.cwd(), "scripts", "check-relative-paths.mjs");
  });

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "test-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("success on valid relative paths", () => {
    const distDir = join(tmpDir, "dist");
    mkdirSync(distDir);
    writeFileSync(
      join(distDir, "index.html"),
      '<script src="./app.js"></script><link href="styles.css" />'
    );
    writeFileSync(
      join(distDir, "styles.css"),
      'body { background: url(./bg.png); }'
    );

    const stdout = execFileSync("node", [scriptPath], {
      cwd: tmpDir,
      encoding: "utf8",
    });

    expect(stdout).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("failure on absolute paths", () => {
    const distDir = join(tmpDir, "dist");
    mkdirSync(distDir);
    writeFileSync(
      join(distDir, "index.html"),
      '<script src="/app.js"></script>'
    );
    writeFileSync(
      join(distDir, "styles.css"),
      'body { background: url(/bg.png); }'
    );

    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);

    // Validate the stderr output correctly reports absolute paths
    const expectedHtmlPath = join("dist", "index.html");
    const expectedCssPath = join("dist", "styles.css");

    expect(error.stderr).toContain(`✗ Found 2 absolute paths in dist/`);
    expect(error.stderr).toContain(`${expectedHtmlPath} → /app.js`);
    expect(error.stderr).toContain(`${expectedCssPath} → /bg.png`);
  });

  test("failure on missing dist directory", () => {
    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("could not scan dist/. Run `npm run build` first.");
  });
});

import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SCRIPT_PATH = join(process.cwd(), "scripts/check-relative-paths.mjs");

test.describe("check-relative-paths.mjs", () => {
  let tmpDir: string;

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-test-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("exits with 2 if dist/ directory does not exist", () => {
    let error: any;
    try {
      execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    } catch (e: any) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("could not scan dist/");
  });

  test("exits with 0 if no absolute paths are found in dist/", () => {
    mkdirSync(join(tmpDir, "dist"));
    writeFileSync(join(tmpDir, "dist", "index.html"), `<script src="./main.js"></script>`);
    writeFileSync(join(tmpDir, "dist", "main.css"), `body { background: url('./bg.png'); }`);

    const output = execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    expect(output).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("exits with 1 and logs errors if absolute paths are found", () => {
    mkdirSync(join(tmpDir, "dist"));
    writeFileSync(join(tmpDir, "dist", "index.html"), `<script src="/main.js"></script><link href="/styles.css">`);
    writeFileSync(join(tmpDir, "dist", "main.css"), `body { background: url('/bg.png'); }`);

    let error: any;
    try {
      execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    } catch (e: any) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("Found 3 absolute paths in dist/");

    // Check paths are constructed safely for assertions using node:path's join
    const indexHtmlPath = join("dist", "index.html");
    const mainCssPath = join("dist", "main.css");

    expect(error.stderr).toContain(`${indexHtmlPath} → /main.js`);
    expect(error.stderr).toContain(`${indexHtmlPath} → /styles.css`);
    expect(error.stderr).toContain(`${mainCssPath} → /bg.png`);
  });
});

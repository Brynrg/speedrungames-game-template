import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test.describe("check-relative-paths.mjs", () => {
  let tmpDir: string;
  let scriptPath: string;

  test.beforeAll(() => {
    scriptPath = join(process.cwd(), "scripts", "check-relative-paths.mjs");
  });

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("fails if dist/ does not exist", () => {
    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8", stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("check-relative-paths: could not scan dist/");
  });

  test("passes if dist/ exists and contains only relative paths", () => {
    mkdirSync(join(tmpDir, "dist"));
    writeFileSync(join(tmpDir, "dist", "index.html"), `<img src="./relative.png" />`);
    writeFileSync(join(tmpDir, "dist", "style.css"), `body { background: url('relative.png'); }`);

    const output = execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8", stdio: "pipe" });
    expect(output).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("fails if dist/ contains absolute paths", () => {
    mkdirSync(join(tmpDir, "dist"));
    writeFileSync(join(tmpDir, "dist", "index.html"), `<img src="/absolute.png" />`);
    writeFileSync(join(tmpDir, "dist", "style.css"), `body { background: url('/absolute-bg.png'); }`);

    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8", stdio: "pipe" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("✗ Found 2 absolute paths in dist/");
    const expectedHtmlPath = join("dist", "index.html");
    const expectedCssPath = join("dist", "style.css");
    expect(error.stderr).toContain(`${expectedHtmlPath} → /absolute.png`);
    expect(error.stderr).toContain(`${expectedCssPath} → /absolute-bg.png`);
  });
});

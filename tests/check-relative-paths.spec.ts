import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, sep } from "node:path";
import { tmpdir } from "node:os";

// The script under test
const SCRIPT_PATH = join(process.cwd(), "scripts", "check-relative-paths.mjs");

test.describe("check-relative-paths.mjs", () => {
  let tmpDir: string;

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-test-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("fails if dist directory is missing", () => {
    let error: any;
    try {
      execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("could not scan dist/");
  });

  test("passes if all paths in dist/ are relative", () => {
    mkdirSync(join(tmpDir, "dist"));
    mkdirSync(join(tmpDir, "dist", "assets"));

    // Relative paths
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<script src="./assets/bar.js"></script><link href='style.css'>`
    );
    writeFileSync(
      join(tmpDir, "dist", "assets", "style.css"),
      `body { background: url('../bg.png'); }`
    );

    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    expect(stdout).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("fails and lists offenders if absolute paths are found", () => {
    mkdirSync(join(tmpDir, "dist"));
    mkdirSync(join(tmpDir, "dist", "assets"));

    // Absolute paths
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<script src="/assets/bar.js"></script><link href='/style.css'>`
    );
    writeFileSync(
      join(tmpDir, "dist", "assets", "style.css"),
      `body { background: url('/bg.png'); }`
    );

    let error: any;
    try {
      execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.status).toBe(1);

    const stderr = error.stderr;
    expect(stderr).toContain("Found 3 absolute paths in dist/");
    expect(stderr).toContain(`dist${sep}index.html → /assets/bar.js`);
    expect(stderr).toContain(`dist${sep}index.html → /style.css`);
    expect(stderr).toContain(`dist${sep}assets${sep}style.css → /bg.png`);
  });

  test("ignores absolute paths that are root-relative (//domain.com)", () => {
    mkdirSync(join(tmpDir, "dist"));

    // Scheme-relative / protocol-relative paths which start with //
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<script src="//cdn.example.com/lib.js"></script>`
    );
    writeFileSync(
      join(tmpDir, "dist", "style.css"),
      `body { background: url('//cdn.example.com/bg.png'); }`
    );

    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: tmpDir, encoding: "utf8" });
    expect(stdout).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });
});

import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = join(fileURLToPath(import.meta.url), "../../scripts/check-relative-paths.mjs");

test.describe("check-relative-paths.mjs", () => {
  let tmpDir: string;

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-test-"));
    mkdirSync(join(tmpDir, "dist"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("passes when no absolute paths are found", () => {
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<img src="./assets/foo.png"><link href="styles.css">`
    );
    writeFileSync(
      join(tmpDir, "dist", "styles.css"),
      `body { background: url('./bg.png'); }`
    );

    const result = execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    expect(result).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("fails when absolute paths are found in HTML", () => {
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<img src="/assets/foo.png">`
    );

    let error: any;
    try {
      execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("✗ Found 1 absolute path in dist/.");
    expect(error.stderr).toContain("dist/index.html → /assets/foo.png");
  });

  test("fails when absolute paths are found in CSS", () => {
    writeFileSync(
      join(tmpDir, "dist", "styles.css"),
      `body { background: url('/bg.png'); }`
    );

    let error: any;
    try {
      execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("✗ Found 1 absolute path in dist/.");
    expect(error.stderr).toContain("dist/styles.css → /bg.png");
  });

  test("checks subdirectories recursively", () => {
    mkdirSync(join(tmpDir, "dist", "assets"));
    writeFileSync(
      join(tmpDir, "dist", "assets", "nested.html"),
      `<link href="/styles.css">`
    );

    let error: any;
    try {
      execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("✗ Found 1 absolute path in dist/.");
    expect(error.stderr).toContain("dist/assets/nested.html → /styles.css");
  });

  test("ignores files without matching extensions", () => {
    writeFileSync(
      join(tmpDir, "dist", "ignored.txt"),
      `This is a text file with an absolute path: /absolute/path.png`
    );

    const result = execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    expect(result).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("finds multiple absolute paths across multiple files", () => {
    writeFileSync(
      join(tmpDir, "dist", "index.html"),
      `<img src="/assets/foo.png"><link href="/styles.css">`
    );
    writeFileSync(
      join(tmpDir, "dist", "styles.css"),
      `body { background: url('/bg.png'); }`
    );

    let error: any;
    try {
      execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("✗ Found 3 absolute paths in dist/.");
    expect(error.stderr).toContain("dist/index.html → /assets/foo.png");
    expect(error.stderr).toContain("dist/index.html → /styles.css");
    expect(error.stderr).toContain("dist/styles.css → /bg.png");
  });

  test("fails when dist/ does not exist", () => {
    rmSync(join(tmpDir, "dist"), { recursive: true, force: true });

    let error: any;
    try {
      execSync(`node ${scriptPath}`, { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("could not scan dist/");
    expect(error.stderr).toContain("Run \`npm run build\` first.");
  });
});

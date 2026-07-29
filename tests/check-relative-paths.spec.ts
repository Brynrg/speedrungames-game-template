import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test.describe("check-relative-paths script", () => {
  let tmpDir: string;
  const scriptPath = join(process.cwd(), "scripts/check-relative-paths.mjs");

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "check-paths-test-"));
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("fails with code 2 if dist/ is missing", () => {
    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain("Run `npm run build` first");
  });

  test("succeeds if dist/ contains only valid relative paths", () => {
    const distDir = join(tmpDir, "dist");
    mkdirSync(distDir);
    mkdirSync(join(distDir, "assets"));

    writeFileSync(join(distDir, "index.html"), `<img src="./assets/img.png">`);
    writeFileSync(join(distDir, "assets", "style.css"), `body { background: url('./bg.png'); }`);
    writeFileSync(join(distDir, "main.js"), `const asset = "./assets/data.json";`);

    const output = execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    expect(output).toContain("✓ check-relative-paths: no absolute paths in dist/");
  });

  test("fails with code 1 and lists offenders if absolute paths are found", () => {
    const distDir = join(tmpDir, "dist");
    mkdirSync(distDir);
    mkdirSync(join(distDir, "nested"));

    // offender 1
    writeFileSync(join(distDir, "index.html"), `<link href="/assets/style.css">`);
    // offender 2
    writeFileSync(join(distDir, "nested", "style.css"), `background: url('/img.png');`);
    // safe
    writeFileSync(join(distDir, "safe.js"), `import "./safe.css";`);

    let error: any;
    try {
      execFileSync("node", [scriptPath], { cwd: tmpDir, encoding: "utf8" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain("Found 2 absolute paths in dist/");

    // Use path.join to ensure cross-platform compatibility for stderr assertions
    const htmlPath = join("dist", "index.html");
    const cssPath = join("dist", "nested", "style.css");

    expect(error.stderr).toContain(`${htmlPath} → /assets/style.css`);
    expect(error.stderr).toContain(`${cssPath} → /img.png`);
  });
});

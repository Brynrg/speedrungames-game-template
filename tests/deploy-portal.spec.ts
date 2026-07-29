import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("deploy-portal rejects invalid status flag", () => {
  // Setup isolated temporary environment
  const testDir = mkdtempSync(join(tmpdir(), "deploy-portal-test-"));
  const portalDir = join(testDir, "speedrungames");
  const scriptsDir = join(testDir, "scripts");
  const distDir = join(testDir, "dist");

  mkdirSync(portalDir);
  mkdirSync(join(portalDir, "scripts"));
  mkdirSync(scriptsDir);
  mkdirSync(distDir);

  // Mock required files
  writeFileSync(join(portalDir, "scripts", "ingest-game-build.mjs"), "console.log('mock ingest');");
  writeFileSync(join(distDir, "index.html"), "<html>mock dist</html>");

  // Copy script to test
  cpSync(join(process.cwd(), "scripts", "deploy-portal.mjs"), join(scriptsDir, "deploy-portal.mjs"));

  let error: any;
  try {
    execFileSync("node", [
      join(scriptsDir, "deploy-portal.mjs"),
      "--portal", portalDir,
      "--status", "invalid-status"
    ], { encoding: "utf8" });
  } catch (e: any) {
    error = e;
  }

  expect(error).toBeDefined();
  expect(error.status).toBe(1);
  expect(error.stderr).toContain("Invalid status: \"invalid-status\"");
});

test("deploy-portal accepts valid status flag", () => {
  // Setup isolated temporary environment
  const testDir = mkdtempSync(join(tmpdir(), "deploy-portal-test-"));
  const portalDir = join(testDir, "speedrungames");
  const scriptsDir = join(testDir, "scripts");
  const distDir = join(testDir, "dist");

  mkdirSync(portalDir);
  mkdirSync(join(portalDir, "scripts"));
  mkdirSync(scriptsDir);
  mkdirSync(distDir);

  // Mock required files
  writeFileSync(join(portalDir, "scripts", "ingest-game-build.mjs"), "console.log('mock ingest');");
  writeFileSync(join(distDir, "index.html"), "<html>mock dist</html>");

  // Copy script to test
  cpSync(join(process.cwd(), "scripts", "deploy-portal.mjs"), join(scriptsDir, "deploy-portal.mjs"));

  const output = execFileSync("node", [
    join(scriptsDir, "deploy-portal.mjs"),
    "--portal", portalDir,
    "--status", "draft"
  ], { encoding: "utf8" });

  expect(output).toContain("Ingesting this game into");
  expect(output).toContain("status=draft");
});

import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test.describe("deploy-portal.mjs", () => {
  let tmpDir: string;
  let repoDir: string;
  let deployScript: string;

  test.beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "test-deploy-portal-"));
    repoDir = join(tmpDir, "repo");
    mkdirSync(join(repoDir, "scripts"), { recursive: true });

    deployScript = join(repoDir, "scripts", "deploy-portal.mjs");
    cpSync("scripts/deploy-portal.mjs", deployScript);
  });

  test.afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function setupFakePortal(portalPath: string, succeed = true) {
    mkdirSync(join(portalPath, "scripts"), { recursive: true });
    if (succeed) {
      writeFileSync(join(portalPath, "scripts", "ingest-game-build.mjs"), "console.log('FAKE INGEST OK');");
    }
  }

  function setupDist() {
    mkdirSync(join(repoDir, "dist"), { recursive: true });
    writeFileSync(join(repoDir, "dist", "index.html"), "mock");
  }

  test("resolves portal via --portal flag", () => {
    const portalDir = join(tmpDir, "custom-portal");
    setupFakePortal(portalDir);
    setupDist();

    const output = execFileSync("node", [deployScript, "--portal", portalDir], { encoding: "utf-8" });
    expect(output).toContain("FAKE INGEST OK");
    expect(output).toContain(`Ingesting this game into ${portalDir}`);
  });

  test("resolves portal via SPEEDRUNGAMES_PORTAL env var", () => {
    const portalDir = join(tmpDir, "env-portal");
    setupFakePortal(portalDir);
    setupDist();

    const output = execFileSync("node", [deployScript], {
      encoding: "utf-8",
      env: { ...process.env, SPEEDRUNGAMES_PORTAL: portalDir },
    });
    expect(output).toContain("FAKE INGEST OK");
    expect(output).toContain(`Ingesting this game into ${portalDir}`);
  });

  test("resolves portal via fallback to ../speedrungames", () => {
    const portalDir = join(tmpDir, "speedrungames"); // sibling to repo
    setupFakePortal(portalDir);
    setupDist();

    const output = execFileSync("node", [deployScript], { encoding: "utf-8" });
    expect(output).toContain("FAKE INGEST OK");
    expect(output).toContain(`Ingesting this game into ${portalDir}`);
  });

  test("fails when no portal is found", () => {
    setupDist();

    let error: any;
    try {
      execFileSync("node", [deployScript], { encoding: "utf-8", stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.stderr.toString()).toContain("Could not find a speedrungames portal checkout");
  });

  test("fails when dist/index.html is missing", () => {
    const portalDir = join(tmpDir, "speedrungames");
    setupFakePortal(portalDir);
    // don't call setupDist()

    let error: any;
    try {
      execFileSync("node", [deployScript], { encoding: "utf-8", stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.stderr.toString()).toContain("No dist/index.html");
  });
});

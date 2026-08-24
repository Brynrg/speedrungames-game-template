import { test, expect } from "@playwright/test";
import { mock } from "node:test";
import fs from "node:fs";
import { resolve } from "node:path";
import { resolvePortal } from "../scripts/resolve-portal.mjs";

test.describe("resolvePortal", () => {
  test.afterEach(() => {
    mock.restoreAll();
  });

  test("returns null if neither candidate has the ingest script", () => {
    mock.method(fs, "existsSync", () => false);
    const p = resolvePortal("some/path", "/fake/repo");
    expect(p).toBeNull();
  });

  test("returns the provided path if it has the ingest script", () => {
    const pPath = "some/valid/path";
    mock.method(fs, "existsSync", () => true);
    const p = resolvePortal(pPath, "/fake/repo");
    expect(p).toBe(resolve(pPath));
  });

  test("returns the sibling repo path if it has the ingest script and provided path doesn't", () => {
    const repoPath = "/fake/repo";
    const siblingPath = resolve(repoPath, "..", "speedrungames");
    const pPath = "invalid/path";
    mock.method(fs, "existsSync", (filePath) => filePath === resolve(siblingPath, "scripts/ingest-game-build.mjs"));
    const p = resolvePortal(pPath, repoPath);
    expect(p).toBe(resolve(siblingPath));
  });

  test("returns the sibling repo path if no path is provided and sibling has the ingest script", () => {
    const repoPath = "/fake/repo";
    const siblingPath = resolve(repoPath, "..", "speedrungames");
    mock.method(fs, "existsSync", (filePath) => filePath === resolve(siblingPath, "scripts/ingest-game-build.mjs"));
    const p = resolvePortal(undefined, repoPath);
    expect(p).toBe(resolve(siblingPath));
  });
});

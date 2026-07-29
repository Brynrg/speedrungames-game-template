import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const scriptPath = join(process.cwd(), 'scripts', 'check-relative-paths.mjs');

test.describe('check-relative-paths.mjs', () => {
  let tempDir: string;

  test.beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'test-paths-'));
  });

  test.afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('exits with status 2 if dist/ is missing', () => {
    let error: any;
    try {
      execFileSync('node', [scriptPath], { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(2);
    expect(error.stderr).toContain('check-relative-paths: could not scan dist/. Run `npm run build` first.');
  });

  test('exits with status 0 if all paths are relative', () => {
    mkdirSync(join(tempDir, 'dist'));
    writeFileSync(join(tempDir, 'dist', 'index.html'), '<link rel="stylesheet" href="./style.css"><script src="main.js"></script>');
    writeFileSync(join(tempDir, 'dist', 'style.css'), 'body { background: url("../bg.png"); }');

    const output = execFileSync('node', [scriptPath], { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
    expect(output).toContain('✓ check-relative-paths: no absolute paths in dist/');
  });

  test('exits with status 1 if absolute paths are found', () => {
    mkdirSync(join(tempDir, 'dist'));
    writeFileSync(join(tempDir, 'dist', 'index.html'), '<link rel="stylesheet" href="/style.css">');
    writeFileSync(join(tempDir, 'dist', 'main.js'), 'const a = 1;'); // valid
    writeFileSync(join(tempDir, 'dist', 'style.css'), 'body { background: url("/bg.png"); }');

    let error: any;
    try {
      execFileSync('node', [scriptPath], { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain('✗ Found 2 absolute paths in dist/.');
    expect(error.stderr).toContain('dist/index.html → /style.css');
    expect(error.stderr).toContain('dist/style.css → /bg.png');
  });

  test('recursively checks nested directories', () => {
    mkdirSync(join(tempDir, 'dist'));
    mkdirSync(join(tempDir, 'dist', 'assets'));
    writeFileSync(join(tempDir, 'dist', 'assets', 'index.css'), 'body { background: url("/img/bg.png"); }');

    let error: any;
    try {
      execFileSync('node', [scriptPath], { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    expect(error.stderr).toContain('✗ Found 1 absolute path in dist/.');
    expect(error.stderr).toContain('dist/assets/index.css → /img/bg.png');
  });
});

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePortal } from '../scripts/deploy-portal.mjs';

test.describe('resolvePortal', () => {
  const origExistsSync = fs.existsSync;

  test.afterEach(() => {
    fs.existsSync = origExistsSync;
  });

  test('resolves custom portal path when script exists', () => {
    fs.existsSync = (p: fs.PathLike) => {
      // Need to stringify p for Playwright's types, but checking if the exact path was requested
      if (typeof p === 'string' && p.endsWith(path.normalize('/custom/portal/scripts/ingest-game-build.mjs'))) return true;
      return origExistsSync(p);
    };
    expect(resolvePortal('/custom/portal')).toBe(path.resolve('/custom/portal'));
  });

  test('resolves fallback portal path when custom path fails', () => {
    fs.existsSync = (p: fs.PathLike) => {
      if (typeof p === 'string' && p.endsWith(path.normalize('speedrungames/scripts/ingest-game-build.mjs'))) return true;
      return origExistsSync(p);
    };
    expect(resolvePortal('/custom/portal')?.endsWith('speedrungames')).toBe(true);
  });

  test('returns null when no portal has the script', () => {
    fs.existsSync = (p: fs.PathLike) => {
      if (typeof p === 'string' && p.includes('ingest-game-build.mjs')) return false;
      return origExistsSync(p);
    };
    expect(resolvePortal('/custom/portal')).toBeNull();
  });
});

// PB persistence — localStorage with a namespaced key per game.
// Replace SLUG below with your game's slug (also used in speedrungames registry).

import type { Split } from "./speedrun.ts";

const SLUG = "REPLACE_ME";
const KEY = `speedrungames:${SLUG}:pb`;

export interface PersonalBest {
  ms: number;
  achievedAt: number;
  splits?: Split[];
}

export function getPB(): PersonalBest | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersonalBest) : null;
  } catch {
    return null;
  }
}

/** Saves only if the new time beats the existing PB. Returns true if it did. */
export function maybeSavePB(pb: PersonalBest): boolean {
  const existing = getPB();
  if (existing && existing.ms <= pb.ms) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(pb));
    return true;
  } catch {
    return false;
  }
}

export function clearPB(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

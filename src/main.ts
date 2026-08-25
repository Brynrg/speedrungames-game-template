// Entry point. Wires the canvas, the game loop, the timer, and the HUD.
//
// This file ships a tiny demo (click N targets as fast as you can) so the
// template deploys to a playable state on day one. REPLACE the gameplay
// section below with your game.

import { Game } from "speedrungames-sdk/game";
import { SpeedrunTimer } from "speedrungames-sdk/timer";
import { createHUD } from "speedrungames-sdk/hud";
import { createStorage } from "speedrungames-sdk/storage";
import { submitRun } from "speedrungames-sdk/leaderboard";
import { newTarget } from "./target.ts";
import "./styles.css";

// Must match game.manifest.json#slug. Set this by hand — see AGENTS.md
// "Mandatory edits before shipping". (`pnpm new:game` substitutes
// game.manifest.json, index.html and README.md; it does not touch this file.)
//
// The `: string` annotation is load-bearing: without it TS narrows SLUG to a
// literal as soon as you set a real slug, and both comparisons below become
// TS2367 "no overlap" errors.
const SLUG: string = "__SLUG__";
// Built from two parts so a placeholder substitution pass over this file can
// never rewrite the sentinel too. If both sides became the real slug the guard
// would be always-true: PB storage would silently fall back to the
// "template-demo" key and submitRun() would never fire. Same fix as the guard
// in .github/workflows/deploy.yml.
const UNSET_SLUG = `__${"SLUG"}__`;

const root = document.getElementById("app");
if (!root) throw new Error("#app element missing in index.html");

const canvas = document.createElement("canvas");
canvas.className = "game-canvas";
root.appendChild(canvas);

const hud = createHUD(root);
const game = new Game(canvas);
const timer = new SpeedrunTimer();
const storage = createStorage(SLUG === UNSET_SLUG ? "template-demo" : SLUG);

const pb = storage.getPB();
hud.setPB(pb?.ms ?? null);
hud.setStatus("Click anywhere to start");

timer.subscribe((ms, state) => hud.setTime(ms, state));

// ─── Gameplay (replace this section) ────────────────────────────────────────

const TARGET_HITS = 5;
const TARGET_RADIUS_FRAC = 0.06;
const COLOR_BACKGROUND = "#0b0b10";
const COLOR_TEXT = "#eaeaf0";
const COLOR_TARGET = "#ffcc00";
let target = { x: 0.5, y: 0.5, hits: 0 };

canvas.addEventListener("pointerdown", async (e) => {
  const state = timer.getState();
  if (state === "idle" || state === "finished") {
    timer.start();
    target = newTarget(0);
    hud.setStatus(`Hit ${TARGET_HITS} targets`);
    return;
  }
  if (state !== "running") return;

  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const aspect = rect.width / rect.height;
  const dx = (px - target.x) * (aspect > 1 ? 1 : aspect);
  const dy = py - target.y;
  if (Math.hypot(dx, dy) >= TARGET_RADIUS_FRAC) return;

  target.hits += 1;
  timer.split(`hit ${target.hits}`);

  if (target.hits >= TARGET_HITS) {
    const ms = timer.finish();
    const splits = [...timer.getSplits()];
    const isPB = storage.maybeSavePB({ ms, achievedAt: Date.now(), splits });
    if (isPB) hud.setPB(ms);
    hud.setStatus(isPB ? "New PB! Click to retry" : "Click to retry");
    if (SLUG !== UNSET_SLUG) {
      // Best-effort: fire-and-forget. Never blocks the player.
      void submitRun({ slug: SLUG, ms, splits });
    }
  } else {
    target = newTarget(target.hits);
  }
});

game.onDraw(({ ctx, width, height }) => {
  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.fillRect(0, 0, width, height);

  if (timer.getState() === "idle") {
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = "20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Click anywhere to start", width / 2, height / 2);
    return;
  }

  const r = TARGET_RADIUS_FRAC * Math.min(width, height);
  const tx = target.x * width;
  const ty = target.y * height;

  ctx.fillStyle = COLOR_TARGET;
  ctx.beginPath();
  ctx.arc(tx, ty, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.font = `bold ${Math.floor(r * 0.9)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(TARGET_HITS - target.hits), tx, ty);
});

// ─── End gameplay ───────────────────────────────────────────────────────────

game.start();

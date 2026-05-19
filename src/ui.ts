// HUD overlay — timer + PB display. Style in styles.css.

import { formatTime, type TimerState } from "./speedrun.ts";

export interface HUD {
  setTime(ms: number, state: TimerState): void;
  setPB(ms: number | null): void;
  setStatus(text: string | null): void;
}

export function createHUD(parent: HTMLElement): HUD {
  const hud = document.createElement("div");
  hud.className = "hud";
  hud.innerHTML = `
    <div class="hud-row">
      <div class="hud-label">TIME</div>
      <div class="hud-time" data-role="time">00:00.000</div>
    </div>
    <div class="hud-row hud-pb" data-role="pb-row" hidden>
      <div class="hud-label">PB</div>
      <div class="hud-time" data-role="pb">—</div>
    </div>
    <div class="hud-status" data-role="status" hidden></div>
  `;
  parent.appendChild(hud);

  const timeEl = hud.querySelector<HTMLElement>('[data-role="time"]')!;
  const pbRow = hud.querySelector<HTMLElement>('[data-role="pb-row"]')!;
  const pbEl = hud.querySelector<HTMLElement>('[data-role="pb"]')!;
  const statusEl = hud.querySelector<HTMLElement>('[data-role="status"]')!;

  return {
    setTime(ms, state) {
      timeEl.textContent = formatTime(ms);
      timeEl.dataset.state = state;
    },
    setPB(ms) {
      if (ms == null) {
        pbRow.hidden = true;
        return;
      }
      pbRow.hidden = false;
      pbEl.textContent = formatTime(ms);
    },
    setStatus(text) {
      if (!text) {
        statusEl.hidden = true;
        statusEl.textContent = "";
        return;
      }
      statusEl.hidden = false;
      statusEl.textContent = text;
    },
  };
}

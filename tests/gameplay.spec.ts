import { test, expect } from "@playwright/test";

const URL = "http://localhost:4173/";

test.describe("Gameplay Loop", () => {
  test("full game playthrough", async ({ page }) => {
    // Mock Math.random() to always return 0.5 for deterministic target placement
    await page.addInitScript(() => {
      Math.random = () => 0.5;
    });

    await page.goto(URL, { waitUntil: "load" });

    // Wait for the game canvas to load
    const canvas = page.locator("canvas.game-canvas");
    await expect(canvas).toBeVisible();

    // Verify initial HUD state
    const statusHud = page.locator('[data-role="status"]');
    await expect(statusHud).toHaveText("Click anywhere to start");

    // Click to start the game
    await canvas.click({ position: { x: 10, y: 10 } });

    // Verify HUD updates to running state
    await expect(statusHud).toHaveText("Hit 5 targets");

    // Target calculation:
    // newTarget: x = 0.1 + 0.5 * 0.8 = 0.5, y = 0.15 + 0.5 * 0.7 = 0.5
    // Target is exactly in the middle of the canvas
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas bounding box not found");

    const targetX = box.width * 0.5;
    const targetY = box.height * 0.5;

    // Click the target 5 times
    for (let i = 0; i < 5; i++) {
      await canvas.click({ position: { x: targetX, y: targetY } });
      await page.waitForTimeout(50); // slight pause to ensure event loop ticks
    }

    // Verify game finished
    await expect(statusHud).toHaveText(/New PB! Click to retry|Click to retry/);

    // Optionally check that the time is displayed
    const timeHud = page.locator('[data-role="time"]');
    await expect(timeHud).toBeVisible();
    const timeText = await timeHud.textContent();
    expect(timeText).toMatch(/\d{2}:\d{2}\.\d{3}/);
  });
});

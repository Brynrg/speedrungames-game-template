import { test, expect } from "@playwright/test";

const URL = "http://localhost:4173/";

test.describe("gameplay", () => {
  test.beforeEach(async ({ page }) => {
    // Make Math.random deterministic for consistent target placement
    await page.addInitScript(() => {
      Math.random = () => 0.5;
    });
    await page.goto(URL, { waitUntil: "load" });
  });

  test("full gameplay loop creates PB", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    const status = page.locator('[data-role="status"]');
    const time = page.locator('[data-role="time"]');
    const pbRow = page.locator('[data-role="pb-row"]');
    const pbTime = page.locator('[data-role="pb"]');

    // Initial state
    await expect(status).toHaveText("Click anywhere to start");
    await expect(time).toHaveText("00:00.000");

    // Start game
    await canvas.click({ position: { x: 10, y: 10 } });
    await expect(status).toHaveText("Hit 5 targets");

    // Play the game
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // With Math.random = 0.5, newTarget returns {x: 0.5, y: 0.5}
    const targetX = box.x + box.width * 0.5;
    const targetY = box.y + box.height * 0.5;

    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(50);
      await page.mouse.click(targetX, targetY);
    }

    // Verify game finished
    await expect(status).toHaveText("New PB! Click to retry");
    await expect(time).toHaveAttribute("data-state", "finished");
    await expect(pbRow).not.toBeHidden();

    // Verify a time is recorded
    const finalTime = await time.textContent();
    const pbFinalTime = await pbTime.textContent();
    expect(finalTime).not.toBe("00:00.000");
    expect(finalTime).toEqual(pbFinalTime);

    // Restart game
    await canvas.click({ position: { x: 10, y: 10 } });
    await expect(status).toHaveText("Hit 5 targets");
    // After restarting, the time might be running (not exactly 00:00.000, or we can check the state)
    await expect(time).toHaveAttribute("data-state", "running");

    // PB row should still be visible from previous run
    await expect(pbRow).not.toBeHidden();
  });

  test("missing targets does not progress game", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    const status = page.locator('[data-role="status"]');

    // Start game
    await canvas.click({ position: { x: 10, y: 10 } });
    await expect(status).toHaveText("Hit 5 targets");

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Click outside target
    const missX = box.x + 10;
    const missY = box.y + 10;

    for (let i = 0; i < 5; i++) {
      await page.mouse.click(missX, missY);
      await page.waitForTimeout(50);
    }

    // Game should still be running, not finished
    await expect(status).toHaveText("Hit 5 targets");
  });
});

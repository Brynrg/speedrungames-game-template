import { test, expect } from "@playwright/test";
import { newTarget } from "../src/target";

test("newTarget generates coordinates within expected bounds", () => {
  for (let i = 0; i < 100; i++) {
    const t = newTarget(i);
    expect(t.x).toBeGreaterThanOrEqual(0.1);
    expect(t.x).toBeLessThan(0.9);
    expect(t.y).toBeGreaterThanOrEqual(0.15);
    expect(t.y).toBeLessThan(0.85);
    expect(t.hits).toBe(i);
  }
});

import { test, expect } from "@playwright/test";
import { newTarget } from "../src/target";

test("newTarget generates coordinates within expected bounds", () => {
  for (let i = 0; i < 100; i++) {
    const target = newTarget(i);
    expect(target.x).toBeGreaterThanOrEqual(0.1);
    expect(target.x).toBeLessThan(0.9);
    expect(target.y).toBeGreaterThanOrEqual(0.15);
    expect(target.y).toBeLessThan(0.85);
    expect(target.hits).toBe(i);
  }
});

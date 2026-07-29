import { test, expect } from "@playwright/test";
import { newTarget } from "../src/target";

test.describe("newTarget", () => {
  test("generates target with predictable bounds", () => {
    // Mock Math.random to return 0 to test lower bounds
    const oldRandom = Math.random;
    Math.random = () => 0;

    try {
      const targetMin = newTarget(1);
      expect(targetMin.x).toBeCloseTo(0.1);
      expect(targetMin.y).toBeCloseTo(0.15);
      expect(targetMin.hits).toBe(1);

      // Mock Math.random to return 0.999 to test upper bounds
      Math.random = () => 0.999;
      const targetMax = newTarget(2);
      expect(targetMax.x).toBeCloseTo(0.1 + 0.999 * 0.8);
      expect(targetMax.y).toBeCloseTo(0.15 + 0.999 * 0.7);
      expect(targetMax.hits).toBe(2);

      // Mock Math.random to return 0.5 to test middle bounds
      Math.random = () => 0.5;
      const targetMid = newTarget(0);
      expect(targetMid.x).toBeCloseTo(0.1 + 0.5 * 0.8);
      expect(targetMid.y).toBeCloseTo(0.15 + 0.5 * 0.7);
      expect(targetMid.hits).toBe(0);

    } finally {
      // Restore Math.random
      Math.random = oldRandom;
    }
  });
});

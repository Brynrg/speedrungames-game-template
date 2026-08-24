import { test, expect } from "@playwright/test";
import { newTarget } from "../src/target.ts";

test.describe("newTarget", () => {
  test("generates target with predictable random values", () => {
    // Mock Math.random
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const target = newTarget(3);
      expect(target).toEqual({
        x: 0.1 + 0.5 * 0.8, // 0.1 + 0.4 = 0.5
        y: 0.15 + 0.5 * 0.7, // 0.15 + 0.35 = 0.5
        hits: 3,
      });
    } finally {
      // Restore Math.random
      Math.random = originalRandom;
    }
  });
});

import { test, expect } from "@playwright/test";
import { newTarget } from "../src/target";

test.describe("newTarget", () => {
  let originalRandom: typeof Math.random;

  test.beforeEach(() => {
    originalRandom = Math.random;
  });

  test.afterEach(() => {
    Math.random = originalRandom;
  });

  test("returns correct values for minimum bounds (Math.random() = 0)", () => {
    Math.random = () => 0;
    const result = newTarget(1);
    expect(result).toEqual({ x: 0.1, y: 0.15, hits: 1 });
  });

  test("returns correct values for median bounds (Math.random() = 0.5)", () => {
    Math.random = () => 0.5;
    const result = newTarget(2);
    expect(result.x).toBeCloseTo(0.5); // 0.1 + 0.5 * 0.8
    expect(result.y).toBeCloseTo(0.5); // 0.15 + 0.5 * 0.7
    expect(result.hits).toBe(2);
  });

  test("returns correct values for maximum bounds (Math.random() = 0.999)", () => {
    Math.random = () => 0.999;
    const result = newTarget(5);
    expect(result.x).toBeCloseTo(0.1 + 0.999 * 0.8);
    expect(result.y).toBeCloseTo(0.15 + 0.999 * 0.7);
    expect(result.hits).toBe(5);
  });
});

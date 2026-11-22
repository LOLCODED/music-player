import { describe, expect, it } from "vitest";
import { scrubIndex } from "./scrubIndex";

describe("scrubIndex", () => {
  it("maps an offset to its band", () => {
    expect(scrubIndex(0, 270, 27)).toBe(0);
    expect(scrubIndex(15, 270, 27)).toBe(1);
    expect(scrubIndex(269, 270, 27)).toBe(26);
  });

  it("clamps a finger dragged past either end", () => {
    expect(scrubIndex(-40, 270, 27)).toBe(0);
    expect(scrubIndex(900, 270, 27)).toBe(26);
  });

  it("survives an empty strip", () => {
    expect(scrubIndex(10, 0, 27)).toBe(0);
    expect(scrubIndex(10, 100, 0)).toBe(0);
  });
});

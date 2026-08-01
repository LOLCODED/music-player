import { shuffleArray } from "./shuffle";

describe("shuffleArray", () => {
  it("returns a new array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles empty and single-element arrays", () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });
});

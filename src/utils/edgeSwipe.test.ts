import { edgeSwipeDirection } from "./edgeSwipe";

describe("edgeSwipeDirection", () => {
  it("goes back on a swipe in from the left edge", () => {
    expect(edgeSwipeDirection({ x: 5, y: 300 }, { x: 150, y: 320 }, 390)).toBe(-1);
  });

  it("goes forward on a swipe in from the right edge", () => {
    expect(edgeSwipeDirection({ x: 385, y: 300 }, { x: 240, y: 290 }, 390)).toBe(1);
  });

  it("ignores swipes that start away from the edges", () => {
    expect(edgeSwipeDirection({ x: 100, y: 300 }, { x: 300, y: 300 }, 390)).toBe(0);
  });

  it("ignores short or mostly vertical moves", () => {
    expect(edgeSwipeDirection({ x: 5, y: 300 }, { x: 40, y: 300 }, 390)).toBe(0);
    expect(edgeSwipeDirection({ x: 5, y: 100 }, { x: 120, y: 400 }, 390)).toBe(0);
  });
});

import { edgeAt, edgeSwipeDirection, shouldCommitSwipe, swipeOffsets, swipeProgress } from "./edgeSwipe";

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


describe("edgeAt", () => {
  it("names the edge a touch lands on", () => {
    expect(edgeAt(10, 430)).toBe(-1);
    expect(edgeAt(420, 430)).toBe(1);
    expect(edgeAt(200, 430)).toBe(0);
  });
});

describe("swipeProgress", () => {
  it("measures back swipes moving right and forward swipes moving left", () => {
    expect(swipeProgress(215, 430, -1)).toBe(0.5);
    expect(swipeProgress(-215, 430, 1)).toBe(0.5);
  });

  it("clamps overshoot and wrong-way drags", () => {
    expect(swipeProgress(-50, 430, -1)).toBe(0);
    expect(swipeProgress(900, 430, -1)).toBe(1);
  });
});

describe("shouldCommitSwipe", () => {
  it("commits past a third of the way or on a flick", () => {
    expect(shouldCommitSwipe(0.4, 0, -1)).toBe(true);
    expect(shouldCommitSwipe(0.1, 0.8, -1)).toBe(true);
    expect(shouldCommitSwipe(0.1, -0.8, 1)).toBe(true);
  });

  it("springs back on a short drag or a flick the other way", () => {
    expect(shouldCommitSwipe(0.2, 0.1, -1)).toBe(false);
    expect(shouldCommitSwipe(0.6, -0.9, -1)).toBe(false);
  });
});

describe("swipeOffsets", () => {
  it("moves the current page off and brings the previous one in going back", () => {
    expect(swipeOffsets(0, 400, -1)).toEqual({ top: 0, under: -120, dim: 0.28 });
    expect(swipeOffsets(1, 400, -1)).toEqual({ top: 400, under: -0, dim: 0 });
  });

  it("slides the next page in from the right going forward", () => {
    expect(swipeOffsets(0, 400, 1)).toEqual({ top: 400, under: -0, dim: 0 });
    expect(swipeOffsets(1, 400, 1).top).toBe(0);
  });
});

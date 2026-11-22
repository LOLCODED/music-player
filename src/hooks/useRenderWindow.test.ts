import { act, renderHook } from "@testing-library/react";
import { useRenderWindow } from "./useRenderWindow";

const range = (n: number, from = 0) => Array.from({ length: n }, (_, i) => from + i);

describe("useRenderWindow", () => {
  it("shows one page, then grows on demand", () => {
    const items = range(250);
    const { result } = renderHook(() => useRenderWindow({}, "k", items, 100));
    expect(result.current.visible).toHaveLength(100);
    expect(result.current.hasHidden).toBe(true);
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(200);
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(250);
    expect(result.current.hasHidden).toBe(false);
  });

  it("reaches far enough to show a jumped-to item", () => {
    const { result } = renderHook(() => useRenderWindow({}, "k", range(1000), 100));
    act(() => result.current.ensureVisible(640));
    expect(result.current.visible).toHaveLength(740);
  });

  it("resets when the list is replaced but not when items are appended", () => {
    const owner = {};
    let items = range(300);
    const { result, rerender } = renderHook(() => useRenderWindow(owner, "k", items, 100));
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(200);

    items = [...items, ...range(50, 300)];
    rerender();
    expect(result.current.visible).toHaveLength(200);

    items = [...items].reverse();
    rerender();
    expect(result.current.visible).toHaveLength(100);
  });
});

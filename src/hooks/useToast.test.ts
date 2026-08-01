import { vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useToast } from "./useToast";
import { TOAST_DURATION_MS } from "../utils/constants";

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useToast", () => {
  it("starts empty and shows the message passed to showToast", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBe("");

    act(() => result.current.showToast("Saved"));

    expect(result.current.toast).toBe("Saved");
  });

  it("clears the message after the toast duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast("Saved"));

    advance(TOAST_DURATION_MS - 1);
    expect(result.current.toast).toBe("Saved");

    advance(1);
    expect(result.current.toast).toBe("");
  });

  it("gives a replacement toast its own full duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast("first"));

    advance(TOAST_DURATION_MS - 500);
    act(() => result.current.showToast("second"));
    expect(result.current.toast).toBe("second");

    // The first toast's timer would have fired by now if it had not been reset.
    advance(TOAST_DURATION_MS - 1);
    expect(result.current.toast).toBe("second");

    advance(1);
    expect(result.current.toast).toBe("");
  });

  it("does not fire its timer after unmount", () => {
    const { result, unmount } = renderHook(() => useToast());
    act(() => result.current.showToast("Saved"));

    unmount();

    expect(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 2)).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});

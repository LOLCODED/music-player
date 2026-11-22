import { act, render, renderHook } from "@testing-library/react";
import { hasCachedState, useCachedState, useScrollRestoration } from "./usePageCache";

describe("useCachedState", () => {
  it("restores the last value for the same owner after remounting", () => {
    const owner = {};
    const first = renderHook(() => useCachedState(owner, "k", 0));
    act(() => first.result.current[1](5));
    first.unmount();

    const second = renderHook(() => useCachedState(owner, "k", 0));
    expect(second.result.current[0]).toBe(5);
    expect(hasCachedState(owner, "k")).toBe(true);
  });

  it("starts fresh for a different owner", () => {
    const first = renderHook(() => useCachedState({}, "k", 0));
    act(() => first.result.current[1](5));

    const other = renderHook(() => useCachedState({}, "k", 0));
    expect(other.result.current[0]).toBe(0);
  });

  it("does not cache without an owner", () => {
    const first = renderHook(() => useCachedState(null, "k", 0));
    act(() => first.result.current[1](5));
    first.unmount();

    expect(hasCachedState(null, "k")).toBe(false);
    expect(renderHook(() => useCachedState(null, "k", 0)).result.current[0]).toBe(0);
  });
});

function Scroller({ owner, ready }: { owner: object; ready: boolean }) {
  const ref = useScrollRestoration<HTMLDivElement>(owner, "list", ready);
  return <div data-testid="scroller" ref={ref} />;
}

describe("useScrollRestoration", () => {
  it("puts the saved position back once the content is ready", () => {
    const owner = {};
    const first = render(<Scroller owner={owner} ready />);
    const el = first.getByTestId("scroller");
    el.scrollTop = 420;
    el.dispatchEvent(new Event("scroll"));
    first.unmount();

    const second = render(<Scroller owner={owner} ready={false} />);
    expect(second.getByTestId("scroller").scrollTop).toBe(0);
    second.rerender(<Scroller owner={owner} ready />);
    expect(second.getByTestId("scroller").scrollTop).toBe(420);
  });
});

import { vi } from "vitest";
import type React from "react";
import { act, renderHook } from "@testing-library/react";
import { useStarToggle } from "./useStarToggle";
import { SubsonicService } from "../services/SubsonicService";

const STARRED_AT = "2024-05-01T12:00:00.000Z";

function mouseEvent(): React.MouseEvent {
  return { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
}

function makeService(overrides: {
  star?: () => Promise<void>;
  unstar?: () => Promise<void>;
}) {
  const service = {
    star: vi.fn(overrides.star ?? (() => Promise.resolve())),
    unstar: vi.fn(overrides.unstar ?? (() => Promise.resolve())),
  };
  return { service, asSubsonicService: service as unknown as SubsonicService };
}

describe("useStarToggle", () => {
  it("falls back to the server value when there is no override", () => {
    const { asSubsonicService } = makeService({});
    const { result } = renderHook(() => useStarToggle(asSubsonicService));

    expect(result.current.isStarred("s1", STARRED_AT)).toBe(true);
    expect(result.current.isStarred("s2", undefined)).toBe(false);
  });

  it("applies the optimistic flip before the request settles", async () => {
    let resolveStar: () => void = () => {};
    const { service, asSubsonicService } = makeService({
      star: () => new Promise<void>((resolve) => (resolveStar = resolve)),
    });
    const { result } = renderHook(() => useStarToggle(asSubsonicService));

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.toggleStar("s1", "song", false, mouseEvent());
    });

    expect(result.current.isStarred("s1", undefined)).toBe(true);
    expect(service.star).toHaveBeenCalledWith("s1", "song");

    await act(async () => {
      resolveStar();
      await pending;
    });

    expect(result.current.isStarred("s1", undefined)).toBe(true);
  });

  it("reverts and reports when starring fails", async () => {
    const onError = vi.fn();
    const { asSubsonicService } = makeService({
      star: () => Promise.reject(new Error("Server unavailable")),
    });
    const { result } = renderHook(() => useStarToggle(asSubsonicService, onError));

    await act(async () => {
      await result.current.toggleStar("s1", "song", false, mouseEvent());
    });

    expect(result.current.isStarred("s1", undefined)).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      "Failed to update favorite: Server unavailable"
    );
  });

  it("reverts and reports when unstarring fails", async () => {
    const onError = vi.fn();
    const { service, asSubsonicService } = makeService({
      unstar: () => Promise.reject(new Error("Server unavailable")),
    });
    const { result } = renderHook(() => useStarToggle(asSubsonicService, onError));

    await act(async () => {
      await result.current.toggleStar("al-1", "album", true, mouseEvent());
    });

    expect(service.unstar).toHaveBeenCalledWith("al-1", "album");
    expect(result.current.isStarred("al-1", STARRED_AT)).toBe(true);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("stops the click from reaching the surrounding card", async () => {
    const { asSubsonicService } = makeService({});
    const { result } = renderHook(() => useStarToggle(asSubsonicService));
    const event = mouseEvent();

    await act(async () => {
      await result.current.toggleStar("s1", "song", false, event);
    });

    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a service", async () => {
    const { result } = renderHook(() => useStarToggle(null));

    await act(async () => {
      await result.current.toggleStar("s1", "song", false, mouseEvent());
    });

    expect(result.current.isStarred("s1", undefined)).toBe(false);
  });
});

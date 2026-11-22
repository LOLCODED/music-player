import { describe, expect, it } from "vitest";
import { Style } from "@capacitor/status-bar";
import { statusBarStyle } from "./useStatusBarStyle";

describe("statusBarStyle", () => {
  it("uses dark text over light skins", () => {
    expect(statusBarStyle("itunes", true)).toBe(Style.Light);
    expect(statusBarStyle("default", false)).toBe(Style.Light);
  });

  it("uses light text over dark skins", () => {
    expect(statusBarStyle("default", true)).toBe(Style.Dark);
    expect(statusBarStyle("y2k", false)).toBe(Style.Dark);
    expect(statusBarStyle("futurism", false)).toBe(Style.Dark);
  });
});

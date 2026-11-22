import { describe, expect, it } from "vitest";
import { classifyNavigation, isTabNavigationState } from "./pageTransition";

const on = { animate: true, tabSwitch: false, appBack: false };

describe("classifyNavigation", () => {
  it("slides pushes in and app-initiated backs out", () => {
    expect(classifyNavigation("PUSH", on)).toBe("push");
    expect(classifyNavigation("POP", { ...on, appBack: true })).toBe("pop");
  });

  it("leaves browser backs, replaces and tab switches instant", () => {
    expect(classifyNavigation("POP", on)).toBe("none");
    expect(classifyNavigation("REPLACE", on)).toBe("none");
    expect(classifyNavigation("PUSH", { ...on, tabSwitch: true })).toBe("none");
  });

  it("never animates with motion off", () => {
    expect(classifyNavigation("PUSH", { ...on, animate: false })).toBe("none");
    expect(classifyNavigation("POP", { animate: false, tabSwitch: false, appBack: true })).toBe("none");
  });
});

describe("isTabNavigationState", () => {
  it("recognises the tab bar's marker only", () => {
    expect(isTabNavigationState({ tab: true })).toBe(true);
    expect(isTabNavigationState({ tab: "yes" })).toBe(false);
    expect(isTabNavigationState(null)).toBe(false);
  });
});

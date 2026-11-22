import { describe, expect, it } from "vitest";
import { resolveMotion } from "./motionPreference";

describe("resolveMotion", () => {
  it("follows Reduce Motion when set to System", () => {
    expect(resolveMotion("system", false)).toBe("on");
    expect(resolveMotion("system", true)).toBe("off");
  });

  it("lets an explicit choice win over the system", () => {
    expect(resolveMotion("on", true)).toBe("on");
    expect(resolveMotion("off", false)).toBe("off");
  });
});

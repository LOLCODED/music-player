import { describe, expect, it } from "vitest";
import { desktopMediaQuery } from "./constants";

describe("desktopMediaQuery", () => {
  it("needs both the width breakpoint and a non-landscape-phone height", () => {
    expect(desktopMediaQuery()).toBe("(min-width: 768px) and (min-height: 500px)");
    expect(desktopMediaQuery(1024)).toBe("(min-width: 1024px) and (min-height: 500px)");
  });
});

import { describe, expect, it } from "vitest";
import { isTextEntry } from "./textEntry";

function input(type: string, readOnly = false): HTMLInputElement {
  const el = document.createElement("input");
  el.type = type;
  el.readOnly = readOnly;
  return el;
}

describe("isTextEntry", () => {
  it("accepts fields that raise the keyboard", () => {
    for (const type of ["text", "search", "url", "password", "email"]) expect(isTextEntry(input(type))).toBe(true);
    expect(isTextEntry(document.createElement("textarea"))).toBe(true);
  });

  it("rejects buttons, toggles, read-only fields and nothing", () => {
    for (const type of ["checkbox", "range", "submit", "file"]) expect(isTextEntry(input(type))).toBe(false);
    expect(isTextEntry(input("text", true))).toBe(false);
    expect(isTextEntry(document.createElement("button"))).toBe(false);
    expect(isTextEntry(null)).toBe(false);
  });
});

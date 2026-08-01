import { formatTrackDuration, formatTotalDuration } from "./duration";

describe("formatTrackDuration", () => {
  it("formats minutes and zero-padded seconds", () => {
    expect(formatTrackDuration(0)).toBe("0:00");
    expect(formatTrackDuration(59)).toBe("0:59");
    expect(formatTrackDuration(61)).toBe("1:01");
    expect(formatTrackDuration(185)).toBe("3:05");
  });

  it("handles invalid input", () => {
    expect(formatTrackDuration(NaN)).toBe("0:00");
    expect(formatTrackDuration(Infinity)).toBe("0:00");
    expect(formatTrackDuration(-5)).toBe("0:00");
  });
});

describe("formatTotalDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatTotalDuration(59)).toBe("0m");
    expect(formatTotalDuration(60)).toBe("1m");
    expect(formatTotalDuration(3600)).toBe("1h 0m");
    expect(formatTotalDuration(4980)).toBe("1h 23m");
  });

  it("handles invalid input", () => {
    expect(formatTotalDuration(NaN)).toBe("0m");
    expect(formatTotalDuration(-1)).toBe("0m");
  });
});

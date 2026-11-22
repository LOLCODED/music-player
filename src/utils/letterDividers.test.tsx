import { letterStarts } from "./letterGroups";
import { withLetterHeadings } from "./letterDividers";

const render = (titles: string[]) => {
  const starts = letterStarts(titles, (t) => t);
  return withLetterHeadings(
    titles,
    starts,
    (t) => t,
    (t) => `item:${t}`,
    (letter, anchor) => `heading:${letter}${anchor ? "*" : ""}`
  );
};

describe("withLetterHeadings", () => {
  it("adds a heading where the letter changes, anchoring the first of each letter", () => {
    expect(render(["Alpha", "Apple", "Bravo"])).toEqual([
      "heading:A*", "item:Alpha", "item:Apple", "heading:B*", "item:Bravo",
    ]);
  });

  it("keeps every run labelled when the server's order strays", () => {
    expect(render(["Bravo", "Tango", "Beta"])).toEqual([
      "heading:B*", "item:Bravo", "heading:T*", "item:Tango", "heading:B", "item:Beta",
    ]);
  });

  it("adds nothing without letter starts", () => {
    expect(withLetterHeadings(["a", "b"], null, (t) => t, (t) => t, () => "x")).toEqual(["a", "b"]);
  });
});

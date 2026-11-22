import { letterAnchorId, letterOf, letterStarts, withoutLeadingArticle } from "./letterGroups";

describe("letterGroups", () => {
  it("files titles by first letter, with digits and symbols under #", () => {
    expect(letterOf("black hole sun")).toBe("B");
    expect(letterOf("  Iris")).toBe("I");
    expect(letterOf("21st Century Liability")).toBe("#");
    expect(letterOf("$uicideboy$")).toBe("#");
    expect(letterOf("Måneskin")).toBe("M");
  });

  it("finds where each letter starts", () => {
    const titles = ["(515)", "Bad Romance", "Black", "Crawling", "Chop Suey!"];
    expect([...letterStarts(titles, (t) => t)]).toEqual([["#", 0], ["B", 1], ["C", 3]]);
  });

  it("makes anchor ids safe for #", () => {
    expect(letterAnchorId("#")).toBe("letter-num");
    expect(letterAnchorId("Q")).toBe("letter-Q");
  });

  it("skips leading articles the way Navidrome sorts names", () => {
    expect(withoutLeadingArticle("The Black Parade")).toBe("Black Parade");
    expect(withoutLeadingArticle("A Perfect Circle")).toBe("Perfect Circle");
    expect(withoutLeadingArticle("Thirty Seconds To Mars")).toBe("Thirty Seconds To Mars");
    expect(withoutLeadingArticle("The")).toBe("The");
  });
});

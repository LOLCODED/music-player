import { fetchAllPages } from "./fetchAllPages";

describe("fetchAllPages", () => {
  const library = Array.from({ length: 1234 }, (_, i) => i);
  const fetchPage = vi.fn(async (count: number, offset: number) =>
    library.slice(offset, offset + count)
  );

  beforeEach(() => fetchPage.mockClear());

  it("keeps fetching until a short page comes back", async () => {
    expect(await fetchAllPages(fetchPage, 500)).toEqual(library);
    expect(fetchPage.mock.calls).toEqual([[500, 0], [500, 500], [500, 1000]]);
  });

  it("stops after an empty page when the total is an exact multiple", async () => {
    const exact = vi.fn(async (count: number, offset: number) =>
      library.slice(0, 1000).slice(offset, offset + count)
    );
    expect(await fetchAllPages(exact, 500)).toHaveLength(1000);
    expect(exact).toHaveBeenCalledTimes(3);
  });
});

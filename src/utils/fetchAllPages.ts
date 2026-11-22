export async function fetchAllPages<T>(
  fetchPage: (count: number, offset: number) => Promise<T[]>,
  pageSize: number
): Promise<T[]> {
  const all: T[] = [];
  for (;;) {
    const page = await fetchPage(pageSize, all.length);
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

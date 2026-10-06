export function useFilters() {
  const filterBySearch = (items = [], query = "", keys = []) => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return items;

    return items.filter((item) =>
      keys.some((key) =>
        String(item?.[key] ?? "")
          .toLowerCase()
          .includes(normalized),
      ),
    );
  };

  const applySort = (items = [], key, direction = "asc") => {
    const sorted = [...items].sort((a, b) => {
      const left = a?.[key] ?? "";
      const right = b?.[key] ?? "";

      if (typeof left === "number" && typeof right === "number") {
        return direction === "asc" ? left - right : right - left;
      }

      return direction === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });

    return sorted;
  };

  return { filterBySearch, applySort };
}

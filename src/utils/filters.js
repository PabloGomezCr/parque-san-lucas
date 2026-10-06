export function applySearch(items = [], query = "", keys = []) {
  const term = query.trim().toLowerCase();

  if (!term) return items;

  return items.filter((item) =>
    keys.some((key) =>
      String(item?.[key] ?? "")
        .toLowerCase()
        .includes(term),
    ),
  );
}

export function sortBy(items = [], key, direction = "asc") {
  return [...items].sort((a, b) => {
    const left = a?.[key] ?? "";
    const right = b?.[key] ?? "";

    if (typeof left === "number" && typeof right === "number") {
      return direction === "asc" ? left - right : right - left;
    }

    return direction === "asc"
      ? String(left).localeCompare(String(right))
      : String(right).localeCompare(String(left));
  });
}

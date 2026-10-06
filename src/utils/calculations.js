export const getPendingTasks = (items = []) =>
  items.filter((item) => item.status === "pending").length;
export const getCompletedTasks = (items = []) =>
  items.filter((item) => item.status === "completed").length;
export const getTouristTotal = (items = []) =>
  items
    .filter((item) => item.status !== "cancelled")
    .reduce((sum, item) => sum + (Number(item.visitorCount) || 1), 0);
export const getMaintenanceStats = (items = []) => ({
  total: items.length,
  inProgress: items.filter((x) => x.status === "in_progress").length,
  planned: items.filter((x) => x.status === "planned").length,
});
export const getSpeciesStats = (items = []) => ({
  total: items.length,
  monitoring: items.filter((x) => x.status === "monitoring").length,
  observed: items.filter((x) => x.status === "observed").length,
});
export function getLatestWellReading(readings = []) {
  return (
    [...readings].sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null
  );
}
export function getWellTrend(readings = []) {
  const ordered = [...readings].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  return ordered.length < 2
    ? null
    : Number((ordered[0].level - ordered[1].level).toFixed(2));
}
export function getModuleMetrics(key, items) {
  const total = items.length;
  const active = items.filter((x) =>
    ["pending", "planned", "in_progress", "monitoring"].includes(x.status),
  ).length;
  const completed = items.filter((x) =>
    ["completed", "resolved", "approved"].includes(x.status),
  ).length;
  const priority = items.filter((x) =>
    ["high", "urgent"].includes(x.priority || x.riskLevel),
  ).length;
  if (key === "tourists")
    return [
      {
        label: "Turistas atendidos",
        value: getTouristTotal(items),
        detail: "Visitantes de los registros disponibles",
      },
      {
        label: "Atenciones registradas",
        value: total,
        detail: "Bitácoras de atención",
      },
      {
        label: "Atenciones pendientes",
        value: active,
        detail: "Pendientes de seguimiento",
      },
      {
        label: "Procedencia",
        value: new Set(items.map((x) => x.origin).filter(Boolean)).size,
        detail: "Procedencias registradas",
      },
    ];
  if (key === "species")
    return [
      {
        label: "Total catalogadas",
        value: total,
        detail: "Especies registradas",
      },
      {
        label: "Prioritarias",
        value: priority,
        detail: "Clasificación mock · por validar",
      },
      {
        label: "En seguimiento",
        value: active,
        detail: "Registros en monitoreo",
      },
      {
        label: "Grupos biológicos",
        value: new Set(items.map((x) => x.category)).size,
        detail: "Categorías del catálogo",
      },
    ];
  return [
    {
      label:
        key === "heritage" ? "Elementos catalogados" : "Registros operativos",
      value: total,
      detail: "Total de registros disponibles",
    },
    {
      label: key === "heritage" ? "Intervenciones activas" : "En seguimiento",
      value: active,
      detail: "Pendientes y en proceso",
    },
    {
      label: "Histórico concluido",
      value: completed,
      detail: "Registros finalizados",
    },
    {
      label: "Cumplimiento",
      value: total ? `${Math.round((completed / total) * 100)}%` : "0%",
      detail: "Calculado desde la bitácora",
    },
  ];
}
export function getRecentActivity(data) {
  return [
    ["tasks", "Tareas", "title", "dueDate"],
    ["tourists", "Turismo", "touristName", "date"],
    ["maintenance", "Mantenimiento", "title", "date"],
    ["heritage", "Patrimonio", "site", "date"],
    ["species", "Especies", "commonName", "lastSeen"],
  ]
    .flatMap(([key, category, titleKey, dateKey]) =>
      data[key].map((item) => ({
        ...item,
        id: `${key}-${item.id}`,
        title: item[titleKey],
        date: item.updatedAt || item[dateKey],
        category,
        path: `/${key}/${item.id}`,
      })),
    )
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}
export function groupTouristsByDate(items) {
  const groups = {};
  for (const item of items)
    if (item.date && item.status !== "cancelled")
      groups[item.date] =
        (groups[item.date] || 0) + (Number(item.visitorCount) || 1);
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
export function filterReportData(data, { type = "all", start = "", end = "" }) {
  const definitions = [
    ["tasks", "Tareas", "title", "dueDate"],
    ["tourists", "Turistas", "touristName", "date"],
    ["maintenance", "Mantenimiento", "title", "date"],
    ["heritage", "Patrimonio", "site", "date"],
    ["species", "Especies", "commonName", "lastSeen"],
    ["wellReadings", "Pozo", "level", "date"],
  ];
  return definitions
    .filter(([key]) => type === "all" || type === key)
    .flatMap(([key, label, title, date]) =>
      data[key]
        .filter(
          (item) =>
            (!start || String(item[date] || "").slice(0, 10) >= start) &&
            (!end || (item[date] && String(item[date]).slice(0, 10) <= end)),
        )
        .map((item) => ({
          id: `${key}-${item.id}`,
          module: label,
          title: String(item[title] ?? ""),
          date: item[date],
          status: item.status,
        })),
    );
}

import { modules } from "../../config/modules";
export function recordFixture(key, overrides = {}) {
  const config = modules[key];
  const record = {
    ...config.initial,
    id: "mock-1",
    description: "Descripción ficticia",
    notes: "Notas ficticias",
  };
  for (const field of config.sections.flatMap((section) => section.fields)) {
    if (record[field.name]) continue;
    record[field.name] =
      field.type === "date"
        ? "2026-01-15"
        : field.type === "number"
          ? 3
          : field.options
            ? field.options[0]
            : "Dato ficticio";
  }
  return { ...record, [config.titleKey]: "Registro ficticio", ...overrides };
}
export const emptyCollections = () => ({
  tasks: [],
  tourists: [],
  maintenance: [],
  heritage: [],
  species: [],
  wellReadings: [],
});

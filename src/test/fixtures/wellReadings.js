export const wellReadingFactory = (overrides = {}) => ({
  id: "well-mock-1",
  date: "2026-01-15T12:00:00Z",
  level: 12,
  flow: 25,
  temperature: 24,
  ph: 7,
  status: "normal",
  source: "manual mock",
  notes: "Lectura ficticia",
  ...overrides,
});

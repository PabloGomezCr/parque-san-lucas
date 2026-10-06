export const weatherTime = (time, timezone) =>
  new Intl.DateTimeFormat("es-CR", {
    timeZone: timezone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(typeof time === "number" ? time * 1000 : time));
export const weatherNumber = (value, unit) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat("es-CR", { maximumFractionDigits: 1 }).format(value)} ${unit}`
    : "Sin información";

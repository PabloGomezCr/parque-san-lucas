import { statusLabels } from "../../utils/formatters";
export function StatusBadge({ status, label }) {
  const contextualTone = {
    technology: "technology",
    heritage: "heritage",
    information: "info",
  }[status];
  const tone =
    contextualTone ||
    ([
      "completed",
      "resolved",
      "approved",
      "stable",
      "observed",
      "low",
    ].includes(status)
      ? "success"
      : ["high", "urgent", "cancelled"].includes(status)
        ? "danger"
        : ["pending", "planned", "medium", "warning"].includes(status)
          ? "warning"
          : "info");
  return (
    <span className="badge status-badge" data-tone={tone}>
      {label || statusLabels[status] || status || "Por validar"}
    </span>
  );
}

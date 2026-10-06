export const statusLabels = {
  pending: "Pendiente",
  planned: "Programado",
  in_progress: "En proceso",
  review: "En revisión",
  delivered: "Entregada",
  completed: "Finalizada",
  cancelled: "Cancelada",
  resolved: "Atendida",
  approved: "Aprobada",
  observed: "Registrada",
  monitoring: "En seguimiento",
  stable: "Estable · mock",
  warning: "Revisar · mock",
  high: "Alta",
  urgent: "Urgente",
  medium: "Media",
  low: "Baja",
};
export function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : new Intl.DateTimeFormat("es-CR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}
export function formatNumber(value) {
  return new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(
    Number(value) || 0,
  );
}

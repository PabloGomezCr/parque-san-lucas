import { SearchX } from "lucide-react";
import { Button } from "../common/Button";
import "./feedback.scss";
export function NoResultsState({
  title = "No se encontraron resultados",
  description = "Ajusta los filtros o limpia la búsqueda.",
  message,
  query,
  onRetry,
  action,
}) {
  return (
    <section className="feedback-state" data-tone="info" role="status">
      <SearchX />
      <h2>{title}</h2>
      <p>
        {message ||
          (query ? `No hay coincidencias para “${query}”.` : description)}
      </p>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
      {action}
    </section>
  );
}

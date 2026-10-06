import { Inbox } from "lucide-react";
import { Button } from "../common/Button";
import "./feedback.scss";
export function EmptyState({
  title = "Sin registros todavía",
  description = "Los registros de esta sección aparecerán aquí.",
  message,
  query,
  onRetry,
  action,
}) {
  return (
    <section className="feedback-state" data-tone="info" role="status">
      <Inbox />
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

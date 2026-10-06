import { CloudOff } from "lucide-react";
import { Button } from "../common/Button";
import "./feedback.scss";
export function ErrorState({
  title = "No fue posible cargar la información",
  description = "Inténtalo de nuevo cuando se restablezca la conexión.",
  message,
  query,
  onRetry,
  action,
}) {
  return (
    <section className="feedback-state" data-tone="error" role="alert">
      <CloudOff />
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

import { CircleCheck } from "lucide-react";
import { Button } from "../common/Button";
import "./feedback.scss";
export function SuccessState({
  title = "Registro guardado correctamente",
  description = "La información está disponible en la bitácora.",
  message,
  query,
  onRetry,
  action,
}) {
  return (
    <section className="feedback-state" data-tone="success" role="status">
      <CircleCheck />
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

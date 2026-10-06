import { SystemLayout } from "../../components/layout/SystemLayout";
import { Link } from "react-router-dom";
import { ErrorState } from "../../components/feedback/ErrorState";
export function NotFoundPage() {
  return (
    <SystemLayout>
      <ErrorState
        title="404 · Página no encontrada"
        message="La ruta solicitada no existe. Puedes volver al inicio para continuar."
        action={
          <Link className="btn btn-primary" to="/dashboard">
            Volver al inicio
          </Link>
        }
      />
    </SystemLayout>
  );
}

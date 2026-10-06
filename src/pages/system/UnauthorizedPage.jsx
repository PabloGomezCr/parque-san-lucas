import { SystemLayout } from "../../components/layout/SystemLayout";
import { Link } from "react-router-dom";
import { ErrorState } from "../../components/feedback/ErrorState";
export function UnauthorizedPage() {
  return (
    <SystemLayout>
      <ErrorState
        title="Acceso restringido"
        message="No tienes acceso a esta sección. Los roles y permisos institucionales están por validar."
        action={
          <Link className="btn btn-primary" to="/dashboard">
            Volver al inicio
          </Link>
        }
      />
    </SystemLayout>
  );
}

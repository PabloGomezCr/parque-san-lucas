import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { incidentService } from "../../services/incidentService";
import { IncidentDetails } from "./IncidentDetails";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
export function IncidentReference({ incidentId }) {
  const { can } = useAuth();
  return can("incident.view") ? (
    <OriginalIncident incidentId={incidentId} />
  ) : (
    <p>Incidencia de origen #{incidentId}</p>
  );
}
function OriginalIncident({ incidentId }) {
  const resource = useResource(incidentService.getIncidentById, incidentId);
  if (resource.loading) return <LoadingSkeleton rows={1} />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  return (
    <section aria-label="Incidencia de origen">
      <IncidentDetails incident={resource.data} />
      <Link to={`/incidents?incident=${encodeURIComponent(incidentId)}`}>
        Consultar incidencia original
      </Link>
    </section>
  );
}

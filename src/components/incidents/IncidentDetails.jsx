import { Card } from "../common/Card";
import { formatDate } from "../../utils/formatters";
export function IncidentDetails({ incident }) {
  return (
    <Card title={incident.title}>
      <p>{incident.description}</p>
      <dl className="record-details">
        <div>
          <dt>Ubicación reportada</dt>
          <dd>{incident.location || "Sin registrar"}</dd>
        </div>
        <div>
          <dt>Enviada por</dt>
          <dd>{incident.reportedByName || "Guía de demostración"}</dd>
        </div>
        <div>
          <dt>Fecha del reporte</dt>
          <dd>{formatDate(incident.reportedAt)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            {{
              received: "Recibida",
              reviewed: "Revisada",
              converted: "Convertida",
            }[incident.status] || incident.status}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

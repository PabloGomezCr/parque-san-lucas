import { Link } from "react-router-dom";
import { useResource } from "../../hooks/useResource";
import { delegationService } from "../../services/delegationService";
import { Card } from "../common/Card";
import { StatCard } from "../dashboard/StatCard";
import { DataTable } from "../common/DataTable";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { formatDate } from "../../utils/formatters";
export function DelegationSummary() {
  const resource = useResource(delegationService.getSummary);
  if (resource.loading) return <LoadingSkeleton rows={2} />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const data = resource.data;
  return (
    <Card title="Supervisión de delegaciones">
      <div className="metric-grid">
        <StatCard label="Asignadas a mí" value={data.assignedToMe.length} />
        <StatCard label="Delegadas por mí" value={data.delegatedByMe.length} />
      </div>
      {data.assignedToMe.length > 0 && (
        <div className="stack">
          <h3>Mis responsabilidades</h3>
          {data.assignedToMe.map((item) => (
            <Link
              key={`${item.moduleKey}/${item.id}`}
              to={`/${item.moduleKey}/${item.id}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
      {data.history.length ? (
        <DataTable
          caption="Resumen de delegaciones del parque"
          data={[...data.history].sort((a, b) =>
            b.delegatedAt.localeCompare(a.delegatedAt),
          )}
          columns={[
            {
              key: "title",
              label: "Registro",
              render: (row) => (
                <Link to={`/${row.moduleKey}/${row.recordId}`}>
                  {row.title}
                </Link>
              ),
            },
            { key: "assignedToName", label: "Responsable" },
            { key: "assignedByName", label: "Delegado por" },
            {
              key: "delegatedAt",
              label: "Fecha",
              render: (row) => formatDate(row.delegatedAt),
            },
          ]}
        />
      ) : (
        <p>Sin delegaciones registradas.</p>
      )}
    </Card>
  );
}

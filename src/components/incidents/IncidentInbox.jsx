import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { useMutation } from "../../hooks/useMutation";
import { incidentService } from "../../services/incidentService";
import { PageHeader } from "../layout/PageHeader";
import { Button } from "../common/Button";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { EmptyState } from "../feedback/EmptyState";
import { IncidentDetails } from "./IncidentDetails";
import { formatDate } from "../../utils/formatters";
export function IncidentInbox() {
  const { can } = useAuth();
  const resource = useResource(incidentService.getIncidents);
  const [params, setParams] = useSearchParams();
  const mutation = useMutation(async (id, moduleKey) =>
    moduleKey
      ? incidentService.convert(id, moduleKey)
      : incidentService.markReviewed(id),
  );
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const selected = (resource.data || []).find(
    (item) => String(item.id) === params.get("incident"),
  );
  const open = (id) => {
    mutation.clearError();
    setParams({ incident: id });
  };
  const close = () => {
    if (!mutation.busy) {
      mutation.clearError();
      setParams({});
    }
  };
  const act = async (moduleKey) => {
    if (await mutation.run(selected.id, moduleKey)) resource.reload();
  };
  return (
    <>
      <PageHeader
        title="Incidencias del parque"
        subtitle="Revisa reportes enviados por guías del parque y vincula su atención operativa."
        actions={
          <Button variant="secondary" onClick={resource.reload}>
            Actualizar incidencias
          </Button>
        }
      />
      {resource.data?.length ? (
        <DataTable
          caption="Incidencias recibidas"
          data={resource.data}
          columns={[
            {
              key: "title",
              label: "Incidencia",
              render: (item) => (
                <Button variant="ghost" onClick={() => open(item.id)}>
                  {item.title}
                </Button>
              ),
            },
            { key: "reportedByName", label: "Enviada por" },
            {
              key: "reportedAt",
              label: "Fecha",
              render: (item) => formatDate(item.reportedAt),
            },
            {
              key: "status",
              label: "Estado",
              render: (item) =>
                ({
                  received: "Recibida",
                  reviewed: "Revisada",
                  converted: "Convertida",
                })[item.status] || item.status,
            },
          ]}
        />
      ) : (
        <EmptyState title="No hay incidencias recibidas" />
      )}
      {params.get("incident") && !selected && (
        <p role="alert">La incidencia no está disponible en este parque.</p>
      )}
      <Modal
        open={Boolean(selected)}
        title="Revisión de incidencia"
        onClose={close}
        busy={mutation.busy}
      >
        {selected && (
          <>
            <IncidentDetails incident={selected} />
            {mutation.error && <p role="alert">{mutation.error}</p>}
            {selected.convertedRecord ? (
              <Link
                to={`/${selected.convertedRecord.moduleKey}/${selected.convertedRecord.id}`}
              >
                Abrir registro vinculado
              </Link>
            ) : (
              can("incident.manage") && (
                <div className="row">
                  {selected.status !== "reviewed" && (
                    <Button disabled={mutation.busy} onClick={() => act()}>
                      Marcar revisada
                    </Button>
                  )}
                  {can("task.create") && (
                    <Button
                      disabled={mutation.busy}
                      onClick={() => act("tasks")}
                    >
                      Convertir en tarea
                    </Button>
                  )}
                  {can("maintenance.create") && (
                    <Button
                      disabled={mutation.busy}
                      onClick={() => act("maintenance")}
                    >
                      Convertir en mantenimiento
                    </Button>
                  )}
                </div>
              )
            )}
            <p className="notice">
              La atención operativa queda vinculada al reporte original; su
              descripción no se copia.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}

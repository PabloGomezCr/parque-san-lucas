import { IncidentReference } from "../incidents/IncidentReference";
import { useAuth } from "../../hooks/useAuth";
import { DelegationPanel } from "../admin/DelegationPanel";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Camera, ShieldCheck } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { StatusBadge } from "../common/StatusBadge";
import { FormField } from "../forms/FormField";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import { Toast } from "../feedback/Toast";
import { SpeciesObservations } from "../species/SpeciesObservations";
import { EvidenceDialog } from "./EvidenceDialog";
import { useRecordActions } from "../../hooks/useRecordActions";
import { statusLabels, formatDate } from "../../utils/formatters";
import "./records.scss";
export function RecordDetail({ config, resource, moduleKey }) {
  const { can, user } = useAuth();
  const item = resource.data;
  const actions = useRecordActions(config, item, resource.reload);
  const [evidence, setEvidence] = useState(false);
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.message || "");
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return (
      <ErrorState
        message={resource.error}
        onRetry={resource.reload}
        action={
          <Link className="btn btn-secondary" to={config.path}>
            Volver al listado
          </Link>
        }
      />
    );
  if (!item) return <ErrorState message="El registro solicitado no existe." />;
  const canUpdateOwnTourist =
    moduleKey === "tourists" &&
    can("tourist.update_own") &&
    String(item.createdByUserId) === String(user?.id);
  return (
    <>
      <PageHeader
        title={item[config.titleKey]}
        section={config.title}
        subtitle={
          item.scientificName ||
          `Ficha de seguimiento · ${config.singular} #${item.id}`
        }
        actions={
          <>
            <Link className="btn btn-secondary" to={config.path}>
              <ArrowLeft size={16} />
              Volver
            </Link>
            {(can(`${config.permission}.edit`) || canUpdateOwnTourist) && (
              <Link
                className="btn btn-primary"
                to={`${config.path}/${item.id}/edit`}
              >
                <Pencil size={16} />
                Editar
              </Link>
            )}
          </>
        }
      />
      <div className="row">
        <StatusBadge status={item.status} />
        <span className="badge">{item[config.categoryKey]}</span>
        <span className="badge">Registro mock · por validar</span>
      </div>
      <div className="content-grid">
        <div className="stack">
          {item.sourceIncidentId && (
            <IncidentReference incidentId={item.sourceIncidentId} />
          )}
          {item.image && (
            <img
              className="record-detail__image"
              src={item.image}
              alt={`Referencia de Stitch para ${item[config.titleKey]}`}
            />
          )}
          {config.sections.map((section) => (
            <Card key={section.title} title={section.title}>
              <dl className="record-details">
                {section.fields
                  .filter((field) => field.name !== config.titleKey)
                  .map((field) => (
                    <div
                      key={field.name}
                      className={field.wide ? "full-width" : ""}
                    >
                      <dt>{field.label}</dt>
                      <dd>
                        {field.type === "date"
                          ? formatDate(item[field.name])
                          : statusLabels[item[field.name]] ||
                            item[field.name] ||
                            "Sin registrar"}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Card>
          ))}
          {moduleKey !== "tourists" && (
            <Card title="Registro fotográfico de evidencia en campo">
              <div className="stack">
                {item.evidence?.length ? (
                  <div className="evidence-grid">
                    {item.evidence.map((file, i) => (
                      <figure key={i}>
                        <a href={file.data} download={file.name}>
                          <img src={file.data} alt={file.name} />
                        </a>
                        <figcaption>{file.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No hay evidencias adjuntas.</p>
                )}
                {can(`${config.permission}.edit`) && (
                  <Button variant="secondary" onClick={() => setEvidence(true)}>
                    <Camera size={16} />
                    Agregar evidencia
                  </Button>
                )}
              </div>
            </Card>
          )}
          {moduleKey === "species" && (
            <SpeciesObservations speciesId={item.id} />
          )}
        </div>
        <aside className="stack">
          {["tasks", "maintenance"].includes(moduleKey) &&
            (can(`${config.permission}.delegate`) ||
              can(`${config.permission}.reassign`) ||
              can("delegation.view_history")) && (
              <DelegationPanel
                key={`${item.id}/${item.assignedToUserId || ""}`}
                item={item}
                moduleKey={moduleKey}
                onSaved={resource.reload}
              />
            )}
          <Card title="Seguimiento del registro">
            <div className="detail-action">
              {can(`${config.permission}.edit`) && (
                <FormField label="Cambiar estado">
                  <select
                    value={item.status}
                    onChange={(e) => actions.setAction(e.target.value)}
                  >
                    {config.states.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={
                          config.permission === "task" &&
                          status === "completed" &&
                          !can("task.complete")
                        }
                      >
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
              {config.states.includes("completed") &&
                item.status !== "completed" &&
                can(
                  `${config.permission === "task" ? "task.complete" : `${config.permission}.edit`}`,
                ) && (
                  <Button onClick={() => actions.setAction("completed")}>
                    Marcar como finalizada
                  </Button>
                )}
              {can(`${config.permission}.delete`) && (
                <Button
                  variant="danger"
                  onClick={() => actions.setAction("remove")}
                >
                  <Trash2 size={16} />
                  Eliminar registro
                </Button>
              )}
            </div>
          </Card>
          <Card
            title={
              <>
                <ShieldCheck size={20} />
                Custodia y validación
              </>
            }
          >
            <p className="muted">
              Responsables, permisos y validaciones institucionales están por
              definir. Este registro pertenece al entorno de demostración.
            </p>
            <p className="notice">
              Última actualización:{" "}
              {formatDate(item.updatedAt || item[config.dateKey])}
            </p>
          </Card>
        </aside>
      </div>
      <ConfirmDialog
        open={Boolean(actions.action)}
        title={
          actions.action === "remove"
            ? "¿Eliminar este registro?"
            : "Confirmar cambio de estado"
        }
        message={
          actions.action === "remove"
            ? "Se eliminará este registro de la base de datos de demostración. Esta acción no se puede deshacer."
            : `El estado cambiará a “${statusLabels[actions.action]}”.`
        }
        destructive={actions.action === "remove"}
        confirmLabel={
          actions.action === "remove" ? "Eliminar registro" : "Confirmar cambio"
        }
        busy={actions.busy}
        error={actions.error}
        onCancel={actions.cancel}
        onConfirm={actions.confirm}
      />
      {evidence && (
        <EvidenceDialog
          config={config}
          item={item}
          onClose={() => setEvidence(false)}
          onSaved={() => {
            setEvidence(false);
            setToast("Evidencia guardada correctamente.");
            resource.reload();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

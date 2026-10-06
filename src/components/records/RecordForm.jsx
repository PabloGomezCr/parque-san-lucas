import { useAuth } from "../../hooks/useAuth";
import { AssigneeSelect } from "../admin/AssigneeSelect";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShieldCheck, MapPin } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";
import { FormField } from "../forms/FormField";
import { FormSection } from "../forms/FormSection";
import { FormActions } from "../forms/FormActions";
import { EvidenceInput } from "../forms/EvidenceInput";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import { statusLabels } from "../../utils/formatters";
import "./records.scss";
export function RecordForm({ config, editor, id }) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [cancel, setCancel] = useState(false);
  if (editor.loading) return <LoadingSkeleton />;
  if (editor.loadError)
    return <ErrorState message={editor.loadError} onRetry={editor.reload} />;
  return (
    <>
      <PageHeader
        title={id ? config.editTitle : config.createTitle}
        section={config.title}
        subtitle="Ingresa los datos del registro para el seguimiento operativo del parque."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              editor.dirty ? setCancel(true) : navigate(config.path)
            }
          >
            <ArrowLeft size={16} />
            Volver al listado
          </Button>
        }
      />
      {config.permission === "heritage" && (
        <p className="notice">
          Registrar una intervención no significa autorizarla. Las
          autorizaciones institucionales están por validar.
        </p>
      )}
      <div className="content-grid">
        <form className="stack" noValidate onSubmit={editor.submit}>
          {editor.error && (
            <div className="form-alert" role="alert">
              {editor.error}
            </div>
          )}
          {config.sections.map((section) => (
            <FormSection key={section.title} title={section.title}>
              <div className="form-grid">
                {section.fields.map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    required={field.required}
                    error={editor.errors[field.name]}
                    className={field.wide ? "full-width" : ""}
                  >
                    {field.name === "assignedTo" &&
                    can(`${config.permission}.delegate`) ? (
                      id ? (
                        <input
                          value={editor.form.assignedTo || "Sin asignar"}
                          readOnly
                          aria-label={field.label}
                        />
                      ) : (
                        <AssigneeSelect
                          permission={`${config.permission}.delegate`}
                          value={editor.form.assignedToUserId || ""}
                          onChange={editor.setAssignee}
                          disabled={editor.saving}
                        />
                      )
                    ) : field.options ? (
                      <select
                        name={field.name}
                        value={editor.form[field.name] ?? ""}
                        onChange={editor.change}
                        disabled={editor.saving}
                      >
                        {field.options.map((option) => (
                          <option
                            key={option}
                            value={option}
                            disabled={
                              (config.permission === "heritage" &&
                                option === "approved" &&
                                !can("heritage.edit")) ||
                              (field.name === "status" &&
                                config.permission === "task" &&
                                option === "completed" &&
                                !can("task.complete"))
                            }
                          >
                            {statusLabels[option] || option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={editor.form[field.name] ?? ""}
                        onChange={editor.change}
                        required={field.required}
                        disabled={editor.saving}
                        rows={4}
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type || "text"}
                        value={editor.form[field.name] ?? ""}
                        onChange={editor.change}
                        min={field.min}
                        step={field.step}
                        required={field.required}
                        disabled={editor.saving}
                        maxLength={field.type ? undefined : 200}
                      />
                    )}
                  </FormField>
                ))}
              </div>
            </FormSection>
          ))}
          {id && can(`${config.permission}.reassign`) && (
            <p>
              Para cambiar responsables usa la sección de delegación en el
              detalle del registro.
            </p>
          )}
          {config.path !== "/tourists" && (
            <FormSection title="Evidencia de campo">
              <EvidenceInput
                value={editor.form.evidence}
                onChange={editor.setEvidence}
                disabled={editor.saving}
              />
            </FormSection>
          )}
          <FormActions>
            <Button
              variant="ghost"
              disabled={editor.saving}
              onClick={() =>
                editor.dirty ? setCancel(true) : navigate(config.path)
              }
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={editor.saving}>
              <Save size={16} />
              {editor.saving ? "Guardando…" : `Guardar ${config.singular}`}
            </Button>
          </FormActions>
        </form>
        <aside className="stack">
          <Card
            title={
              <>
                <MapPin size={20} />
                Sector del parque
              </>
            }
          >
            <p>Parque Nacional Isla San Lucas</p>
            <p className="muted">Ubicación y coordenadas por validar.</p>
            <div className="notice">
              Coordenadas no registradas. No se realizan conversiones ni se
              capturan coordenadas automáticamente.
            </div>
          </Card>
          <Card
            title={
              <>
                <ShieldCheck size={20} />
                Registro operativo
              </>
            }
          >
            <p className="muted">
              Los campos marcados con * son obligatorios. Las categorías,
              prioridades y responsables son configurables y están por validar.
            </p>
          </Card>
          <Link className="text-link" to="/profile">
            Consultar mi perfil
          </Link>
        </aside>
      </div>
      <ConfirmDialog
        open={cancel}
        title="¿Descartar los cambios?"
        message="Los cambios que no hayas guardado se perderán."
        destructive
        confirmLabel="Descartar cambios"
        onCancel={() => setCancel(false)}
        onConfirm={() => navigate(config.path)}
      />
    </>
  );
}

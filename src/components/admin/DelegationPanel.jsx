import { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { FormField } from "../forms/FormField";
import { DataTable } from "../common/DataTable";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { useResource } from "../../hooks/useResource";
import { useMutation } from "../../hooks/useMutation";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { delegationService } from "../../services/delegationService";
import { formatDate } from "../../utils/formatters";
const loadCandidates = (permission) => userService.getEligibleUsers(permission);
export function DelegationPanel({ item, moduleKey, onSaved }) {
  const { can } = useAuth();
  const prefix = moduleKey === "tasks" ? "task" : "maintenance";
  const permission = `${prefix}.${item.assignedToUserId ? "reassign" : "delegate"}`;
  const allowed = can(permission);
  const candidates = useResource(
    allowed ? loadCandidates : noCandidates,
    permission,
  );
  const [selected, setSelected] = useState("");
  const mutation = useMutation(delegationService.delegate);
  return (
    <Card title="Delegación y responsables">
      <p>Responsable: {item.assignedTo || "Sin asignar"}</p>
      {item.assignedByUserId && (
        <p>
          Delegado por:{" "}
          {item.delegationHistory?.at(-1)?.assignedByName ||
            item.assignedByUserId}{" "}
          · {formatDate(item.delegatedAt)}
        </p>
      )}
      {allowed &&
        (candidates.loading ? (
          <LoadingSkeleton rows={1} />
        ) : candidates.error ? (
          <ErrorState message={candidates.error} onRetry={candidates.reload} />
        ) : (
          <form
            className="stack"
            onSubmit={async (event) => {
              event.preventDefault();
              const saved = await mutation.run(moduleKey, item.id, selected);
              if (saved) {
                setSelected("");
                onSaved();
              }
            }}
          >
            <FormField label="Usuario responsable" required>
              <select
                value={selected}
                required
                disabled={mutation.busy}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">
                  Selecciona un usuario activo del parque
                </option>
                {(candidates.data || [])
                  .filter(
                    (user) => String(user.id) !== String(item.assignedToUserId),
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </FormField>
            {mutation.error && <p role="alert">{mutation.error}</p>}
            <Button type="submit" disabled={mutation.busy || !selected}>
              {mutation.busy
                ? "Guardando…"
                : item.assignedToUserId
                  ? "Reasignar responsable"
                  : "Delegar registro"}
            </Button>
          </form>
        ))}
      {can("delegation.view_history") && (
        <>
          <h3>Historial de delegación</h3>
          {item.delegationHistory?.length ? (
            <DataTable
              caption="Historial de delegación"
              data={item.delegationHistory}
              columns={[
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
        </>
      )}
    </Card>
  );
}
const noCandidates = async () => [];

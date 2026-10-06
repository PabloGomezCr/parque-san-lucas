import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { speciesService } from "../../services/speciesService";
import { useResource } from "../../hooks/useResource";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { DataTable } from "../common/DataTable";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { EmptyState } from "../feedback/EmptyState";
import { ObservationForm } from "./ObservationForm";
import { formatDate } from "../../utils/formatters";
export function SpeciesObservations({ speciesId }) {
  const { can } = useAuth();
  const resource = useResource(speciesService.getObservations);
  const [open, setOpen] = useState(false);
  const observations = (resource.data || []).filter(
    (item) => String(item.speciesId) === String(speciesId),
  );
  return (
    <Card title="Bitácora cronológica de avistamientos">
      <div className="stack">
        {can("species.observation.create") && (
          <Button onClick={() => setOpen(true)}>
            Registrar avistamiento u observación
          </Button>
        )}
        {resource.loading ? (
          <LoadingSkeleton rows={1} />
        ) : resource.error ? (
          <ErrorState message={resource.error} onRetry={resource.reload} />
        ) : observations.length ? (
          <DataTable
            data={observations}
            caption="Observaciones de la especie"
            columns={[
              {
                key: "date",
                label: "Fecha",
                render: (item) => formatDate(item.date),
              },
              { key: "observer", label: "Observador" },
              { key: "comment", label: "Observación" },
            ]}
          />
        ) : (
          <EmptyState title="Sin avistamientos registrados" />
        )}
      </div>
      <Modal
        open={open}
        title="Registrar observación de campo"
        onClose={() => setOpen(false)}
      >
        <ObservationForm
          speciesId={speciesId}
          onCancel={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            resource.reload();
          }}
        />
      </Modal>
    </Card>
  );
}

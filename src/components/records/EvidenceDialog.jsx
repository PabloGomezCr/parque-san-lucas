import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { EvidenceInput } from "../forms/EvidenceInput";
import { useMutation } from "../../hooks/useMutation";
export function EvidenceDialog({ config, item, onClose, onSaved }) {
  const [evidence, setEvidence] = useState(item.evidence || []);
  const mutation = useMutation(config.update);
  return (
    <Modal
      open
      title="Agregar evidencia fotográfica"
      onClose={onClose}
      busy={mutation.busy}
    >
      <EvidenceInput
        value={evidence}
        onChange={setEvidence}
        disabled={mutation.busy}
      />
      {mutation.error && (
        <p className="form-alert" role="alert">
          {mutation.error}
        </p>
      )}
      <Button
        disabled={mutation.busy}
        onClick={async () => {
          const result = await mutation.run(item.id, { evidence });
          if (result) onSaved();
        }}
      >
        {mutation.busy ? "Guardando…" : "Guardar evidencia"}
      </Button>
    </Modal>
  );
}

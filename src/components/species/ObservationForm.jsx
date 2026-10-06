import { useState } from "react";
import { speciesService } from "../../services/speciesService";
import { useMutation } from "../../hooks/useMutation";
import { useAuth } from "../../hooks/useAuth";
import { FormField } from "../forms/FormField";
import { Button } from "../common/Button";
export function ObservationForm({ speciesId, onSaved, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    date: "",
    observer: user?.name || "",
    count: 1,
    location: "",
    comment: "",
  });
  const mutation = useMutation(speciesService.createObservation);
  const change = (e) =>
    setForm((s) => ({
      ...s,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }));
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await mutation.run({
          ...form,
          speciesId: String(speciesId),
          mock: true,
          coordinates: { system: "WGS84", latitude: null, longitude: null },
        });
        if (result) onSaved(result);
      }}
    >
      <p className="muted">
        Avistamiento de campo · datos de demostración, taxonomía y ubicación por
        validar.
      </p>
      <div className="form-grid">
        <FormField label="Fecha del avistamiento" required>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={change}
            required
          />
        </FormField>
        <FormField label="Observador" required>
          <input
            name="observer"
            value={form.observer}
            onChange={change}
            required
          />
        </FormField>
        <FormField label="Cantidad de individuos" required>
          <input
            name="count"
            type="number"
            min="1"
            step="1"
            value={form.count}
            onChange={change}
            required
          />
        </FormField>
        <FormField label="Sector">
          <input name="location" value={form.location} onChange={change} />
        </FormField>
        <FormField label="Observaciones" className="full-width" required>
          <textarea
            name="comment"
            value={form.comment}
            onChange={change}
            required
          />
        </FormField>
      </div>
      {mutation.error && (
        <p className="form-alert" role="alert">
          {mutation.error}
        </p>
      )}
      <div className="row">
        <Button variant="secondary" onClick={onCancel} disabled={mutation.busy}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.busy}>
          {mutation.busy ? "Guardando…" : "Guardar observación"}
        </Button>
      </div>
    </form>
  );
}

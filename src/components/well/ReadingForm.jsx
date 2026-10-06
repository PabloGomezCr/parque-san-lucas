import { useState } from "react";
import { FormField } from "../forms/FormField";
import { Button } from "../common/Button";
import { wellService } from "../../services/wellService";
import { useMutation } from "../../hooks/useMutation";
export function ReadingForm({ onSaved }) {
  const [form, setForm] = useState({
    date: "",
    level: "",
    flow: "",
    temperature: "",
    ph: "",
    notes: "",
  });
  const mutation = useMutation(wellService.createReading);
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await mutation.run({
          ...form,
          level: Number(form.level),
          flow: Number(form.flow),
          temperature: Number(form.temperature),
          ph: Number(form.ph),
          status: "stable",
          mock: true,
          source: "manual-mock",
        });
        if (result) onSaved();
      }}
    >
      <p className="notice">
        Lectura manual de demostración. No controla sensores ni determina
        potabilidad.
      </p>
      <div className="form-grid">
        {[
          { name: "date", label: "Fecha de lectura", type: "datetime-local" },
          { name: "level", label: "Nivel (m)", min: 0 },
          { name: "flow", label: "Caudal (L/min)", min: 0 },
          { name: "temperature", label: "Temperatura (°C)" },
          { name: "ph", label: "pH", min: 0, max: 14 },
        ].map((field) => (
          <FormField key={field.name} label={field.label} required>
            <input
              name={field.name}
              type={field.type || "number"}
              min={field.min}
              max={field.max}
              step="any"
              value={form[field.name]}
              onChange={(e) =>
                setForm({ ...form, [field.name]: e.target.value })
              }
              required
            />
          </FormField>
        ))}
        <FormField label="Notas de campo" className="full-width">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </FormField>
      </div>
      {mutation.error && (
        <p className="form-alert" role="alert">
          {mutation.error}
        </p>
      )}
      <Button type="submit" disabled={mutation.busy}>
        {mutation.busy ? "Guardando…" : "Guardar lectura mock"}
      </Button>
    </form>
  );
}

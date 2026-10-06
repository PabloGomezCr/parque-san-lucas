import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResource } from "./useResource";
const newRecord = async () => null;
export function useRecordEditor(config, id) {
  const resource = useResource(id ? config.getById : newRecord, id);
  const [draft, setDraft] = useState(null);
  const form =
    draft && draft.id === id
      ? draft.value
      : { ...config.initial, ...(resource.data || {}) };
  const setForm = (updater) => setDraft({ id, value: updater(form) });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const savingRef = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const change = (event) => {
    const { name, value, type } = event.target;
    setForm((s) => ({
      ...s,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
    setErrors((s) => ({ ...s, [name]: "" }));
    setError("");
    setDirty(true);
  };
  const setAssignee = (user) => {
    setForm((s) => ({
      ...s,
      assignedTo: user?.name || "",
      assignedToUserId: user?.id || "",
    }));
    setDirty(true);
    setErrors((s) => ({ ...s, assignedTo: "" }));
  };
  const setEvidence = (evidence) => {
    setForm((s) => ({ ...s, evidence }));
    setDirty(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    const next = {};
    for (const field of config.sections.flatMap((section) => section.fields)) {
      const value = form[field.name];
      if (field.required && !String(value ?? "").trim())
        next[field.name] = "Este campo es obligatorio.";
      if (
        field.type === "number" &&
        value !== "" &&
        (!Number.isFinite(Number(value)) || Number(value) < (field.min ?? 0))
      )
        next[field.name] =
          `Introduce un número mayor o igual a ${field.min ?? 0}.`;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      setError("Revisa los campos marcados antes de guardar.");
      return;
    }
    setSaving(true);
    savingRef.current = true;
    setError("");
    try {
      const payload = {
        ...form,
        mock: true,
        updatedAt: new Date().toISOString(),
      };
      const result = id
        ? await config.update(id, payload)
        : await config.create({
            ...payload,
            createdAt: new Date().toISOString(),
          });
      setDirty(false);
      navigate(`${config.path}/${result.id}`, {
        state: { message: "Registro guardado correctamente." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };
  return {
    ...resource,
    form,
    errors,
    error: error || resource.error,
    loadError: resource.error,
    saving,
    dirty,
    change,
    setEvidence,
    setAssignee,
    submit,
  };
}

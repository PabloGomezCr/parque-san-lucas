import { useId, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "../common/Button";
export function EvidenceInput({ value = [], onChange, disabled = false }) {
  const id = useId();
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const select = async (event) => {
    const files = Array.from(event.target.files || []);
    setError("");
    if (
      value.length + files.length > 4 ||
      files.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 1024 * 1024,
      )
    ) {
      setError(
        "Adjunta hasta 4 imágenes JPG, PNG o WebP de máximo 1 MB cada una.",
      );
      event.target.value = "";
      return;
    }
    setReading(true);
    try {
      const images = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({ name: file.name, data: reader.result });
              reader.onerror = () =>
                reject(new Error("No se pudo leer la imagen."));
              reader.readAsDataURL(file);
            }),
        ),
      );
      onChange([...value, ...images]);
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
      event.target.value = "";
    }
  };
  return (
    <div className="stack">
      <div className="upload-field">
        <Camera size={28} />
        <label htmlFor={id}>Fotografía o evidencia de campo · mock</label>
        <small>
          Hasta 4 imágenes de 1 MB. Se guardan con el registro; sin extracción
          GPS.
        </small>
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={select}
          disabled={disabled || reading}
        />
        {reading && <span role="status">Leyendo imágenes…</span>}
        {error && (
          <span role="alert" className="field-error">
            {error}
          </span>
        )}
      </div>
      {value.length > 0 && (
        <div className="evidence-grid">
          {value.map((file, i) => (
            <figure key={`${file.name}-${i}`}>
              <img src={file.data} alt={file.name} />
              <figcaption>{file.name}</figcaption>
              <Button
                variant="ghost"
                disabled={disabled}
                onClick={() =>
                  onChange(value.filter((_, index) => index !== i))
                }
              >
                Quitar imagen {i + 1}
              </Button>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

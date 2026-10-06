import { cloneElement, isValidElement, useId } from "react";
import "./forms.scss";
export function FormField({
  label,
  children,
  hint,
  error,
  id,
  required,
  className = "",
}) {
  const generated = useId();
  const fieldId = id || generated;
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={fieldId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {isValidElement(children)
        ? cloneElement(children, {
            id: fieldId,
            "aria-describedby": error || hint ? `${fieldId}-help` : undefined,
            "aria-invalid": Boolean(error),
          })
        : children}
      {(error || hint) && (
        <small
          id={`${fieldId}-help`}
          className={error ? "field-error" : ""}
          role={error ? "alert" : undefined}
        >
          {error || hint}
        </small>
      )}
    </div>
  );
}

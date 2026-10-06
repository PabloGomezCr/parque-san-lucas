import { useId, useRef } from "react";
export function Tabs({
  options,
  value,
  onChange,
  label = "Secciones",
  children,
}) {
  const id = useId();
  const refs = useRef([]);
  return (
    <>
      <div className="tabs" role="tablist" aria-label={label}>
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-${option.value}`}
            aria-controls={`${id}-panel`}
            aria-selected={value === option.value}
            tabIndex={value === option.value ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              let next;
              if (e.key === "ArrowRight") next = (index + 1) % options.length;
              if (e.key === "ArrowLeft")
                next = (index - 1 + options.length) % options.length;
              if (e.key === "Home") next = 0;
              if (e.key === "End") next = options.length - 1;
              if (next !== undefined) {
                e.preventDefault();
                onChange(options[next].value);
                refs.current[next]?.focus();
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div
        className="stack"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${value}`}
      >
        {children}
      </div>
    </>
  );
}
export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map(({ value: key, label: text }) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

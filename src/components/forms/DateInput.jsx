export function DateInput({ label, ...props }) {
  return <input type="date" {...props} aria-label={label || props.name} />;
}

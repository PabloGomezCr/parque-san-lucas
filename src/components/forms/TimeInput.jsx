export function TimeInput({ label, ...props }) {
  return <input type="time" {...props} aria-label={label || props.name} />;
}

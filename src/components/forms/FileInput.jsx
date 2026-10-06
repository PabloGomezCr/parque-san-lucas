export function FileInput({ label, ...props }) {
  return <input type="file" {...props} aria-label={label || props.name} />;
}

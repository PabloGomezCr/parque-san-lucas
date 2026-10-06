export function TextArea({ label, ...props }) {
  return <textarea {...props} aria-label={label || props.name} rows={4} />;
}

export function TextInput({ label, className = "", ...props }) {
  return (
    <input {...props} className={className} aria-label={label || props.name} />
  );
}

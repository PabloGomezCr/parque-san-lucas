export function SelectInput({ label, children, ...props }) {
  return (
    <select {...props} aria-label={label || props.name}>
      {children}
    </select>
  );
}

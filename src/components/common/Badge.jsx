export function Badge({ children, variant = "default" }) {
  return (
    <span className="badge" data-variant={variant}>
      {children}
    </span>
  );
}

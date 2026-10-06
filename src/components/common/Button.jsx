import "./common.scss";
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      {...props}
    />
  );
}
export function IconButton({ label, ...props }) {
  return (
    <Button
      variant="ghost"
      className="icon-button"
      aria-label={label}
      title={label}
      {...props}
    />
  );
}

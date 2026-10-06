import "./common.scss";
export function Card({ title, children, className = "", ...props }) {
  return (
    <section className={`card ${className}`} {...props}>
      {title && <h2 className="card__heading">{title}</h2>}
      {children}
    </section>
  );
}

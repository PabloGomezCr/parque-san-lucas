import "./feedback.scss";
export function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="metric-grid" role="status" aria-busy="true">
      <span className="sr-only">Cargando información…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}

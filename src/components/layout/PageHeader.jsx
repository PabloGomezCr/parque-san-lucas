import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
export function PageHeader({ title, subtitle, actions, section }) {
  return (
    <>
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/dashboard">Monitoreo Territorial</Link>
        <ChevronRight size={12} />
        <span>Parque Nacional Isla San Lucas</span>
        <ChevronRight size={12} />
        <span>{section || title}</span>
      </nav>
      <header className="page-header">
        <div className="page-header__copy">
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </header>
    </>
  );
}

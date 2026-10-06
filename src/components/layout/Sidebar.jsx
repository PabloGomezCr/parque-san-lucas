import { BrandLogo } from "../branding/BrandLogo";
import { NavLink, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
export function Sidebar({ onLogout }) {
  const { user, can } = useAuth();
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <Link to="/dashboard" className="sidebar-header">
        <BrandLogo variant="full" />
      </Link>
      <div className="sector-card">
        <span className="eyebrow">Sector activo</span>
        <strong>P.N. Isla San Lucas</strong>
        <small>Monitoreo Operativo</small>
      </div>
      <nav className="sidebar-nav">
        {getNavigation(can)
          .filter((item) => item.path !== "/profile")
          .map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>
      <div className="sidebar__footer">
        <Link to="/profile" className="sidebar__profile" aria-label="Mi perfil">
          <div className="avatar">
            {user?.name
              ?.split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <strong>{user?.name}</strong>
            <small className="muted">Perfil de demostración</small>
          </div>
        </Link>
        <div className="sidebar__logout">
          <Button variant="ghost" onClick={onLogout}>
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}

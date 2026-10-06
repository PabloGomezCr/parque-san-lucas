import { NavLink } from "react-router-dom";
import { getNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
export function BottomNavigation() {
  const { can } = useAuth();
  return (
    <nav className="bottom-navigation" aria-label="Navegación móvil">
      {getNavigation(can)
        .filter((item) =>
          ["/dashboard", "/tasks", "/species", "/profile"].includes(item.path),
        )
        .map(({ path, label, icon: Icon }) => (
          <NavLink className="bottom-nav-item" key={path} to={path}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
    </nav>
  );
}

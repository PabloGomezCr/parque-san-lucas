import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import { Drawer } from "../common/Modal";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import { getNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import "./layout.scss";
export function AppLayout() {
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { logout, can } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Sidebar onLogout={() => setConfirm(true)} />
      <div className="main-panel">
        <Navbar onMenu={() => setMenu(true)} />
        <main
          data-module={pathname.split("/")[1] || "dashboard"}
          id="main-content"
          className="page-wrap"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
      <Drawer
        open={menu}
        title="Módulos del parque"
        onClose={() => setMenu(false)}
      >
        <nav className="sidebar-nav">
          {getNavigation(can).map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="nav-link"
              onClick={() => setMenu(false)}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
      </Drawer>
      <ConfirmDialog
        open={confirm}
        title="¿Deseas cerrar tu sesión de trabajo?"
        message="Los registros guardados permanecerán disponibles. Los cambios sin guardar se perderán."
        confirmLabel="Cerrar sesión"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
    </div>
  );
}

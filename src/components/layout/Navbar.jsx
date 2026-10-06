import { BrandLogo } from "../branding/BrandLogo";
import { useState } from "react";
import { Bell, Menu, Moon, Sun, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { IconButton } from "../common/Button";
import { SearchBar } from "../common/SearchBar";
import { Modal } from "../common/Modal";
import { ConnectivityStatus } from "../feedback/ConnectivityStatus";
export function Navbar({ onMenu }) {
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="mobile-menu">
          <IconButton label="Abrir navegación" onClick={onMenu}>
            <Menu size={20} />
          </IconButton>
        </div>
        <Link to="/dashboard" aria-label="Inicio — Isla San Lucas">
          <BrandLogo variant="mark" size="sm" />
        </Link>
        <span className="topbar__park">P.N. Isla San Lucas</span>
      </div>
      <div className="topbar__status">
        <ConnectivityStatus />
      </div>
      <form
        className="topbar__search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/tasks?q=${encodeURIComponent(query)}`);
        }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar tareas, especies, incidencias…"
        />
      </form>
      <div className="topbar-actions">
        <IconButton
          label="Cambiar tema"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        <IconButton
          label="Notificaciones"
          onClick={() => setNotifications(true)}
        >
          <Bell size={18} />
        </IconButton>
        <Link className="avatar" to="/profile" aria-label="Mi perfil">
          <UserRound size={18} />
        </Link>
      </div>
      <Modal
        open={notifications}
        title="Notificaciones"
        onClose={() => setNotifications(false)}
      >
        <p>No hay notificaciones nuevas.</p>
        <p className="muted">
          Las alertas institucionales y su integración están por validar.
        </p>
      </Modal>
    </header>
  );
}

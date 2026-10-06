import { BrandLogo } from "../branding/BrandLogo";
import { Link } from "react-router-dom";
import "../feedback/feedback.scss";
export function SystemLayout({ children }) {
  return (
    <main className="system-state">
      <div className="stack">
        <Link to="/dashboard" aria-label="Inicio — Isla San Lucas">
          <BrandLogo variant="full" />
        </Link>
        {children}
      </div>
    </main>
  );
}

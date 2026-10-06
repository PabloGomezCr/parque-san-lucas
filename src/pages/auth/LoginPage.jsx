import { BrandLogo } from "../../components/branding/BrandLogo";
import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  BadgeCheck,
  KeyRound,
  Gavel,
  Radio,
  Satellite,
  IdCard,
} from "lucide-react";
import { Button, IconButton } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.scss";
export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoMoving, setLogoMoving] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  if (isAuthenticated && !isLoading && !logoMoving)
    return <Navigate to={location.state?.from || "/dashboard"} replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (isLoading || isAuthenticated) return;
    if (!form.email.trim() || !form.password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-terminal">
          <span>● Estación Terrena San Lucas</span>
          <span>
            <Satellite size={16} />
            BGAN · mock
          </span>
        </div>
        <section className="login-card">
          <div className="login-brand">
            <BrandLogo
              size="lg"
              variant="mark"
              animated
              loading={isLoading}
              onMotionChange={setLogoMoving}
            />
            <strong>Parque Nacional Isla San Lucas</strong>
            <span className="badge">
              <BadgeCheck size={14} />
              Mock
            </span>
          </div>
          <div className="login-heading">
            <h1>Iniciar sesión</h1>
            <p>Accede al sistema de monitoreo del parque.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <div className="login-field">
              <div className="row between">
                <label htmlFor="login-email">Correo o usuario</label>
                <small>Institucional</small>
              </div>
              <div className="login-input">
                <IdCard size={20} />
                <input
                  id="login-email"
                  name="email"
                  autoComplete="username"
                  placeholder="ejemplo@sinac.go.cr o código GP-XXXX"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setError("");
                  }}
                  required
                  disabled={isLoading || isAuthenticated}
                />
              </div>
            </div>
            <div className="login-field">
              <div className="row between">
                <label htmlFor="login-password">Contraseña</label>
                <button
                  type="button"
                  className="login-help"
                  onClick={() => setHelp(true)}
                >
                  ¿Olvidaste tu contraseña? <span>[POR VALIDAR]</span>
                </button>
              </div>
              <div className="login-input">
                <LockKeyhole size={20} />
                <input
                  id="login-password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setError("");
                  }}
                  required
                  disabled={isLoading || isAuthenticated}
                />
                <IconButton
                  label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </div>
            </div>
            <label className="login-remember">
              <input type="checkbox" disabled />
              Recordarme en este equipo autorizado <span>[POR VALIDAR]</span>
            </label>
            <div className="login-mfa">
              <KeyRound size={20} />
              <div>
                <strong>Llave FIDO2 / MFA</strong>
                <p>YubiKey o biométrico</p>
              </div>
              <small>[POR VALIDAR]</small>
            </div>
            {error && (
              <p role="alert" className="form-alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="login-submit"
              disabled={isLoading || isAuthenticated}
              aria-busy={isLoading}
            >
              {isLoading
                ? "Ingresando al sistema..."
                : isAuthenticated
                  ? "Acceso verificado"
                  : "Iniciar sesión"}
              <ArrowRight size={20} />
            </Button>
          </form>
          <div className="login-legal">
            <strong>
              <Gavel size={16} />
              Aviso legal y de seguridad
            </strong>
            <p>
              Entorno de demostración para el personal del parque. La
              autenticación, los permisos y las comunicaciones institucionales
              están por validar. Utiliza únicamente datos de prueba.
            </p>
            <small>Acceso mock: sofia.arias@mock.gov / secret123</small>
          </div>
        </section>
        <footer className="login-footer">
          <span>
            <Radio size={18} />
            Canal VHF · por validar
          </span>
          <span>ES</span>
        </footer>
      </div>
      <Modal
        open={help}
        title="Recuperación de contraseña"
        onClose={() => setHelp(false)}
      >
        <p>
          La recuperación institucional está por validar. Para explorar la
          demostración utiliza las credenciales indicadas en el formulario.
        </p>
      </Modal>
    </main>
  );
}

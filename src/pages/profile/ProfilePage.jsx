import { roleLabel } from "../../config/roles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Palette, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useMutation } from "../../hooks/useMutation";
import { authService } from "../../services/authService";
import { readStorage, writeStorage } from "../../utils/storage";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { FormField } from "../../components/forms/FormField";
import { Tabs } from "../../components/common/Tabs";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { Toast } from "../../components/feedback/Toast";
import "./ProfilePage.scss";
export function ProfilePage() {
  const { user, logout, updateUser, can } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: user.name,
    department: user.department,
  });
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [validation, setValidation] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [coordinateSystem, setCoordinateSystem] = useState(() =>
    readStorage("sanlucas-coordinate-system", "WGS84"),
  );
  const profileMutation = useMutation(authService.updateProfile);
  const passwordMutation = useMutation(async (...args) => {
    await authService.changePassword(...args);
    return true;
  });
  const canUpdateProfile = can("profile.edit") || can("profile.update_own");
  return (
    <>
      <PageHeader
        title="Perfil de usuario"
        subtitle={
          canUpdateProfile
            ? "Gestiona tu información, preferencias de interfaz y credenciales de la demostración."
            : "Consulta tu información y preferencias de interfaz."
        }
      />
      <div className="profile-grid">
        <Card className="profile-summary">
          <div className="profile-person">
            <div className="avatar">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{roleLabel(user.role)} · mock</p>
            </div>
          </div>
          <div className="notice">
            <span className="eyebrow">Parque asignado</span>
            <h3>Parque Nacional Isla San Lucas</h3>
          </div>
          <div>
            <small className="muted">Correo de demostración</small>
            <p>{user.email}</p>
          </div>
          <div>
            <small className="muted">Departamento</small>
            <p>{user.department}</p>
          </div>
          <div className="notice">
            <ShieldCheck size={22} />
            <p>Roles, permisos y acreditaciones institucionales por validar.</p>
          </div>
        </Card>
        <div className="stack">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "profile", label: "Perfil" },
              { value: "preferences", label: "Preferencias" },
              ...(canUpdateProfile
                ? [{ value: "security", label: "Seguridad y sesión" }]
                : []),
            ]}
          >
            {tab === "profile" && (
              <Card title="Información del perfil">
                {canUpdateProfile ? (
                  <form
                  className="stack"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const result = await profileMutation.run(user.id, form);
                    if (result) {
                      updateUser(result);
                      setToast("Perfil actualizado correctamente.");
                    }
                  }}
                >
                  <FormField label="Nombre completo" required>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </FormField>
                  <FormField label="Departamento" required>
                    <input
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      required
                    />
                  </FormField>
                  {profileMutation.error && (
                    <p role="alert" className="form-alert">
                      {profileMutation.error}
                    </p>
                  )}
                  <Button type="submit" disabled={profileMutation.busy}>
                    Guardar perfil
                  </Button>
                  </form>
                ) : (
                  <dl className="record-details">
                    <div>
                      <dt>Nombre completo</dt>
                      <dd>{user.name}</dd>
                    </div>
                    <div>
                      <dt>Departamento</dt>
                      <dd>{user.department}</dd>
                    </div>
                  </dl>
                )}
              </Card>
            )}
            {tab === "preferences" && (
              <Card
                title={
                  <>
                    <Palette size={22} />
                    Preferencias de interfaz
                  </>
                }
              >
                <div className="stack">
                  <p className="muted">
                    Ajusta la apariencia visual para tu entorno de trabajo.
                  </p>
                  <div
                    className="theme-options"
                    role="group"
                    aria-label="Tema visual"
                  >
                    {[
                      { value: "light", label: "Tema claro" },
                      { value: "dark", label: "Tema oscuro" },
                      { value: "system", label: "Automático" },
                    ].map(({ value, label }) => (
                      <button
                        type="button"
                        key={value}
                        className="theme-option"
                        aria-pressed={theme === value}
                        onClick={() => setTheme(value)}
                      >
                        <span
                          className={`theme-preview theme-preview--${value}`}
                          aria-hidden="true"
                        />
                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>
                  <FormField
                    label="Sistema de coordenadas preferido"
                    hint="Preferencia conceptual; no se realizan conversiones oficiales."
                  >
                    <select
                      value={coordinateSystem}
                      onChange={(e) => {
                        setCoordinateSystem(e.target.value);
                        writeStorage(
                          "sanlucas-coordinate-system",
                          e.target.value,
                        );
                        setToast("Preferencia guardada.");
                      }}
                    >
                      <option>WGS84</option>
                      <option>CRTM05</option>
                    </select>
                  </FormField>
                  <p className="notice">
                    El modo automático sigue el tema del sistema operativo.
                  </p>
                </div>
              </Card>
            )}
            {tab === "security" && canUpdateProfile && (
              <Card title="Seguridad y credenciales · mock">
                <form
                  className="stack"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setValidation("");
                    if (password.next !== password.confirm) {
                      setValidation("Las contraseñas nuevas no coinciden.");
                      return;
                    }
                    const result = await passwordMutation.run(
                      user.id,
                      password.current,
                      password.next,
                    );
                    if (result) {
                      setPassword({ current: "", next: "", confirm: "" });
                      setToast("Contraseña de demostración actualizada.");
                    }
                  }}
                >
                  <p className="notice">
                    Las credenciales se almacenan en db.json exclusivamente para
                    la demostración local.
                  </p>
                  {[
                    {
                      key: "current",
                      label: "Contraseña actual",
                      autoComplete: "current-password",
                    },
                    {
                      key: "next",
                      label: "Nueva contraseña",
                      autoComplete: "new-password",
                    },
                    {
                      key: "confirm",
                      label: "Confirmar nueva contraseña",
                      autoComplete: "new-password",
                    },
                  ].map(({ key, label, autoComplete }) => (
                    <FormField label={label} key={key} required>
                      <input
                        type="password"
                        autoComplete={autoComplete}
                        value={password[key]}
                        minLength={key === "current" ? 1 : 8}
                        onChange={(e) =>
                          setPassword({ ...password, [key]: e.target.value })
                        }
                        required
                      />
                    </FormField>
                  ))}
                  {(validation || passwordMutation.error) && (
                    <p className="form-alert" role="alert">
                      {validation || passwordMutation.error}
                    </p>
                  )}
                  <Button type="submit" disabled={passwordMutation.busy}>
                    Actualizar contraseña mock
                  </Button>
                  <p className="muted">MFA / FIDO2: por validar.</p>
                </form>
              </Card>
            )}
          </Tabs>
          <Card title="Finalizar sesión de trabajo">
            <div className="row between">
              <p className="muted">Guarda los cambios antes de salir.</p>
              <Button variant="danger" onClick={() => setConfirm(true)}>
                <LogOut size={16} />
                Cerrar sesión
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        title="¿Deseas cerrar tu sesión?"
        message="Los datos guardados permanecerán disponibles en el entorno de demostración."
        confirmLabel="Cerrar sesión"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

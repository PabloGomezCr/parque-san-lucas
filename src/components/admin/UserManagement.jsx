import {
  getAssignablePermissions,
  optionalPermissionLabels,
} from "../../config/permissions";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { useMutation } from "../../hooks/useMutation";
import { userService } from "../../services/userService";
import { assignableRoles, roleLabel } from "../../config/roles";
import { PageHeader } from "../layout/PageHeader";
import { Button } from "../common/Button";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { FormField } from "../forms/FormField";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { Toast } from "../feedback/Toast";
const initial = {
  name: "",
  email: "",
  department: "",
  password: "",
  role: "Supervisor",
  active: true,
  optionalPermissions: [],
};
export function UserManagement() {
  const { can, user, updateUser } = useAuth();
  const resource = useResource(userService.getUsers);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const mutation = useMutation(async (id, values) =>
    id ? userService.updateUser(id, values) : userService.createUser(values),
  );
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const close = () => {
    if (!mutation.busy) setEditing(null);
  };
  const open = (item) => {
    mutation.clearError();
    setForm(item ? { ...initial, ...item } : { ...initial });
    setEditing(item || {});
  };
  return (
    <>
      <PageHeader
        title="Usuarios del parque"
        subtitle="Gestiona únicamente usuarios del parque asignado · mock."
        actions={
          can("users.create") && (
            <Button onClick={() => open(null)}>Crear usuario</Button>
          )
        }
      />
      <DataTable
        caption="Usuarios del parque asignado"
        data={resource.data || []}
        columns={[
          { key: "name", label: "Nombre" },
          { key: "email", label: "Correo" },
          { key: "role", label: "Rol", render: (item) => roleLabel(item.role) },
          {
            key: "active",
            label: "Estado",
            render: (item) => (item.active ? "Activo" : "Inactivo"),
          },
          {
            key: "actions",
            label: "Acciones",
            render: (item) => (
              <div className="stack">
                {can("users.edit") && (
                  <Button
                    variant="secondary"
                    onClick={() => open(item)}
                    aria-label={`Editar usuario ${item.name}`}
                  >
                    Editar
                  </Button>
                )}
                {can("users.assign_role") &&
                  String(item.id) !== String(user.id) && (
                    <RoleAssignment
                      item={item}
                      onSaved={() => {
                        setMessage("Rol asignado correctamente.");
                        resource.reload();
                      }}
                    />
                  )}
                {can("users.assign_role") &&
                  getAssignablePermissions(item.role).length > 0 && (
                    <PermissionAssignment
                      key={`${item.id}/${item.role}/${JSON.stringify(item.optionalPermissions || [])}`}
                      item={item}
                      onSaved={() => {
                        setMessage("Permisos opcionales actualizados.");
                        resource.reload();
                      }}
                    />
                  )}
              </div>
            ),
          },
        ]}
      />
      {!resource.data?.length && (
        <p>No hay usuarios registrados en el parque.</p>
      )}
      <Modal
        open={editing !== null}
        title={
          editing?.id ? "Editar usuario del parque" : "Crear usuario del parque"
        }
        onClose={close}
        busy={mutation.busy}
      >
        <form
          className="stack"
          onSubmit={async (event) => {
            event.preventDefault();
            const saved = await mutation.run(editing.id, form);
            if (saved) {
              if (String(saved.id) === String(user.id)) updateUser?.(saved);
              setEditing(null);
              setMessage("Usuario guardado correctamente.");
              resource.reload();
            }
          }}
        >
          {[
            ["name", "Nombre completo"],
            ["email", "Correo"],
            ["department", "Departamento"],
          ].map(([key, label]) => (
            <FormField key={key} label={label} required={key !== "department"}>
              <input
                type={key === "email" ? "email" : "text"}
                value={form[key]}
                required={key !== "department"}
                disabled={mutation.busy}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            </FormField>
          ))}
          {!editing?.id && (
            <>
              <FormField label="Contraseña de demostración" required>
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  required
                  disabled={mutation.busy}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Rol permitido">
                <select
                  value={form.role}
                  disabled={mutation.busy}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value,
                      optionalPermissions: [],
                    })
                  }
                >
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </FormField>
              {getAssignablePermissions(form.role).length > 0 && (
                <OptionalPermissionFields
                  role={form.role}
                  value={form.optionalPermissions}
                  onChange={(optionalPermissions) =>
                    setForm({ ...form, optionalPermissions })
                  }
                  disabled={mutation.busy}
                />
              )}
            </>
          )}
          {editing?.id && (
            <label>
              <input
                type="checkbox"
                checked={form.active}
                disabled={
                  mutation.busy || String(editing.id) === String(user.id)
                }
                onChange={(event) =>
                  setForm({ ...form, active: event.target.checked })
                }
              />
              Usuario activo
            </label>
          )}
          {mutation.error && <p role="alert">{mutation.error}</p>}
          <Button type="submit" disabled={mutation.busy}>
            {mutation.busy ? "Guardando…" : "Guardar usuario"}
          </Button>
        </form>
      </Modal>
      <Toast message={message} onClose={() => setMessage("")} />
    </>
  );
}
function RoleAssignment({ item, onSaved }) {
  const [role, setRole] = useState(item.role);
  const mutation = useMutation(userService.assignRole);
  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        if (await mutation.run(item.id, role)) onSaved();
      }}
    >
      <FormField label={`Rol de ${item.name}`}>
        <select
          value={role}
          disabled={mutation.busy}
          onChange={(event) => setRole(event.target.value)}
        >
          {assignableRoles.map((value) => (
            <option key={value} value={value}>
              {roleLabel(value)}
            </option>
          ))}
        </select>
      </FormField>
      <Button type="submit" disabled={mutation.busy || role === item.role}>
        Asignar rol
      </Button>
      {mutation.error && <p role="alert">{mutation.error}</p>}
    </form>
  );
}

function OptionalPermissionFields({ role, value, onChange, disabled }) {
  return (
    <fieldset disabled={disabled}>
      <legend>Permisos opcionales</legend>
      {getAssignablePermissions(role).map((permission) => (
        <label key={permission} className="row">
          <input
            type="checkbox"
            checked={value.includes(permission)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...value, permission]
                  : value.filter((item) => item !== permission),
              )
            }
          />
          {optionalPermissionLabels[permission]}
        </label>
      ))}
    </fieldset>
  );
}
function PermissionAssignment({ item, onSaved }) {
  const [permissions, setPermissions] = useState(
    item.optionalPermissions || [],
  );
  const mutation = useMutation(userService.assignOptionalPermissions);
  const unchanged =
    JSON.stringify([...permissions].sort()) ===
    JSON.stringify([...(item.optionalPermissions || [])].sort());
  return (
    <form
      className="stack"
      aria-label={`Permisos de ${item.name}`}
      onSubmit={async (event) => {
        event.preventDefault();
        if (await mutation.run(item.id, permissions)) onSaved();
      }}
    >
      <OptionalPermissionFields
        role={item.role}
        value={permissions}
        onChange={setPermissions}
        disabled={mutation.busy}
      />
      <Button type="submit" disabled={mutation.busy || unchanged}>
        {mutation.busy ? "Guardando…" : "Guardar permisos"}
      </Button>
      {mutation.error && <p role="alert">{mutation.error}</p>}
    </form>
  );
}

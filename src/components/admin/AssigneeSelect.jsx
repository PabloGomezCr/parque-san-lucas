import { userService } from "../../services/userService";
import { useResource } from "../../hooks/useResource";
const loadUsers = (permission) => userService.getEligibleUsers(permission);
export function AssigneeSelect({
  permission,
  value,
  onChange,
  disabled,
  ...inputProps
}) {
  const resource = useResource(loadUsers, permission);
  return (
    <>
      <select
        {...inputProps}
        value={value}
        required
        disabled={disabled || resource.loading}
        onChange={(event) =>
          onChange(
            resource.data.find(
              (user) => String(user.id) === event.target.value,
            ),
          )
        }
      >
        <option value="">
          {resource.loading
            ? "Cargando usuarios…"
            : "Selecciona un usuario activo del parque"}
        </option>
        {(resource.data || []).map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {resource.error && (
        <p role="alert">
          {resource.error}
          <button type="button" onClick={resource.reload}>
            Reintentar usuarios
          </button>
        </p>
      )}
    </>
  );
}

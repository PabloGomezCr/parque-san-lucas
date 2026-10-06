import {
  MASTER_ADMIN,
  ADMIN,
  PARK_RANGER,
  TOUR_GUIDE,
  READ_ONLY,
} from "./roles";
export const masterAdminPermissions = [
  "projection.weather.view",
  "dashboard.view",
  "task.view",
  "task.create",
  "task.edit",
  "task.delegate",
  "task.reassign",
  "task.complete",
  "maintenance.view",
  "maintenance.create",
  "maintenance.edit",
  "maintenance.delegate",
  "maintenance.reassign",
  "heritage.view",
  "heritage.create",
  "heritage.edit",
  "species.view",
  "species.create",
  "species.edit",
  "species.observation.create",
  "tourist.view",
  "tourist.create",
  "tourist.edit",
  "well.view",
  "reports.view",
  "reports.export",
  "users.view",
  "users.create",
  "users.edit",
  "users.assign_role",
  "delegation.view_history",
  "chat.group",
  "chat.direct_admin",
  "profile.view",
  "profile.edit",
];
export const adminBasePermissions = [
  "projection.weather.view",
  "dashboard.view",
  "task.view",
  "task.create",
  "task.edit",
  "maintenance.view",
  "maintenance.create",
  "maintenance.edit",
  "heritage.view",
  "heritage.create",
  "species.view",
  "tourist.view",
  "tourist.create",
  "reports.view",
  "chat.group",
  "chat.direct_admin",
  "profile.view",
  "profile.edit",
];
export const adminOptionalPermissions = [
  "task.delegate",
  "maintenance.delegate",
  "reports.export",
  "users.view",
  "users.edit",
];
export const parkRangerBasePermissions = [
  "projection.weather.view",
  "dashboard.view",
  "task.view",
  "task.create",
  "task.edit",
  "task.complete",
  "maintenance.view",
  "maintenance.create",
  "maintenance.edit",
  "tourist.view",
  "tourist.create",
  "heritage.view",
  "heritage.create",
  "species.view",
  "species.create",
  "species.edit",
  "species.observation.create",
  "well.view",
  "reports.view",
  "incident.view",
  "incident.manage",
  "chat.group",
  "profile.view",
  "profile.edit",
];
export const parkRangerOptionalPermissions = [
  "task.delegate",
  "maintenance.delegate",
  "chat.direct_admin",
];
export const tourGuidePermissions = [
  "projection.weather.view",
  "dashboard.view",
  "tour.view",
  "tour.create",
  "tour.update_own",
  "visitor_group.view",
  "visitor_group.create",
  "visitor_group.update_own",
  "tourist.view",
  "tourist.create",
  "tourist.update_own",
  "incident.create",
  "incident.view_own",
  "park_info.view",
  "routes.view",
  "species.view",
  "heritage.view",
  "chat.group",
  "profile.view",
  "profile.update_own",
];
export const readOnlyPermissions = [
  "dashboard.view",
  "task.view",
  "maintenance.view",
  "heritage.view",
  "species.view",
  "reports.view",
  "profile.view",
];
export const readOnlyOptionalPermissions = [
  "chat.group",
  "projection.weather.view",
];
export const optionalPermissionLabels = {
  "projection.weather.view": "Consultar información meteorológica",
  "task.delegate": "Delegar tareas",
  "maintenance.delegate": "Delegar mantenimiento",
  "reports.export": "Exportar reportes",
  "users.view": "Consultar usuarios",
  "users.edit": "Editar usuarios",
  "chat.group": "Chat grupal del parque",
  "chat.direct_admin": "Chat directo administrativo",
};
const optionalPermissionsByRole = {
  [ADMIN]: adminOptionalPermissions,
  [PARK_RANGER]: parkRangerOptionalPermissions,
  [READ_ONLY]: readOnlyOptionalPermissions,
};
export const getAssignablePermissions = (role) =>
  optionalPermissionsByRole[role] || [];
export function validateOptionalPermissions(role, permissions = []) {
  if (
    !Array.isArray(permissions) ||
    permissions.some(
      (permission) => !getAssignablePermissions(role).includes(permission),
    )
  )
    throw new Error("Hay permisos opcionales no permitidos para este rol.");
  return [...new Set(permissions)];
}
const existingPermissions = [
  "projection.weather.view",
  "dashboard.view",
  "reports.view",
  "reports.export",
  "profile.view",
  "profile.edit",
  "task.view",
  "task.create",
  "task.edit",
  "task.complete",
  "task.delete",
  "maintenance.view",
  "maintenance.create",
  "maintenance.edit",
  "maintenance.complete",
  "maintenance.delete",
  "heritage.view",
  "heritage.create",
  "heritage.edit",
  "heritage.complete",
  "heritage.delete",
  "tourist.view",
  "tourist.create",
  "tourist.edit",
  "tourist.delete",
  "species.view",
  "species.create",
  "species.edit",
  "species.delete",
  "species.observation.create",
  "well.view",
  "well.create",
  "well.edit",
  "well.delete",
];
export const permissionsByRole = {
  [MASTER_ADMIN]: masterAdminPermissions,
  [ADMIN]: adminBasePermissions,
  [PARK_RANGER]: parkRangerBasePermissions,
  [TOUR_GUIDE]: tourGuidePermissions,
  [READ_ONLY]: readOnlyPermissions,
  Supervisor: existingPermissions,
};
export function isActiveUser(user) {
  return Boolean(user?.id && user?.parkId && user.active === true);
}
export function hasPermission(user, permission) {
  return (
    isActiveUser(user) &&
    ((permissionsByRole[user.role] || []).includes(permission) ||
      (getAssignablePermissions(user.role).includes(permission) &&
        Array.isArray(user.optionalPermissions) &&
        user.optionalPermissions.includes(permission)))
  );
}
export function requirePermission(user, permission) {
  if (!hasPermission(user, permission))
    throw new Error("No tienes permiso para realizar esta acción.");
  return user;
}
export function samePark(actor, record) {
  return (
    Boolean(record?.parkId) && String(record.parkId) === String(actor.parkId)
  );
}

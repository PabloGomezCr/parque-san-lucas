import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark, safeUser } from "./sessionAccess";
import {
  samePark,
  requirePermission,
  validateOptionalPermissions,
} from "../config/permissions";
import { assignableRoles } from "../config/roles";
const users = createRepository({ resource: "users" });
function checkedRole(role) {
  if (!assignableRoles.includes(role))
    throw new Error("Este rol no está permitido.");
  return role;
}
function profileValues(values) {
  const name = values.name?.trim();
  const email = values.email?.trim().toLowerCase();
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Ingresa nombre y correo válidos.");
  return { name, email, department: String(values.department || "") };
}
async function uniqueEmail(email, id) {
  if (
    (await users.getAll()).some(
      (user) =>
        user.email.toLowerCase() === email && String(user.id) !== String(id),
    )
  )
    throw new Error("El correo ya está registrado.");
}
export const userService = {
  async getUsers() {
    const actor = await requireActor("users.view");
    return (await users.getAll())
      .filter((user) => samePark(actor, user))
      .map(safeUser);
  },
  async getUserById(id) {
    const actor = await requireActor("users.view");
    return safeUser(requireSamePark(actor, await users.getById(id)));
  },
  async getEligibleUsers(permission) {
    if (
      ![
        "task.delegate",
        "task.reassign",
        "maintenance.delegate",
        "maintenance.reassign",
      ].includes(permission)
    )
      throw new Error("Permiso de delegación inválido.");
    const actor = await requireActor(permission);
    return (await users.getAll())
      .filter((user) => samePark(actor, user) && user.active === true)
      .map(safeUser);
  },
  async createUser(values) {
    const actor = await requireActor("users.create");
    requirePermission(actor, "users.assign_role");
    const profile = profileValues(values);
    const optionalPermissions = validateOptionalPermissions(
      values.role,
      values.optionalPermissions,
    );
    await uniqueEmail(profile.email);
    if (!values.password || values.password.length < 8)
      throw new Error("Utiliza una contraseña mock de al menos 8 caracteres.");
    return safeUser(
      await users.create({
        ...profile,
        password: values.password,
        role: checkedRole(values.role),
        optionalPermissions,
        active: true,
        parkId: actor.parkId,
        createdByUserId: actor.id,
        createdAt: new Date().toISOString(),
        mock: true,
      }),
    );
  },
  async updateUser(id, values) {
    const actor = await requireActor("users.edit");
    const target = requireSamePark(actor, await users.getById(id));
    const profile = profileValues(values);
    await uniqueEmail(profile.email, id);
    if (String(actor.id) === String(id) && values.active === false)
      throw new Error("No puedes desactivar tu propia sesión.");
    return safeUser(
      await users.patch(target.id, {
        ...profile,
        active:
          values.active === undefined ? target.active : values.active === true,
        updatedByUserId: actor.id,
        updatedAt: new Date().toISOString(),
      }),
    );
  },
  async assignOptionalPermissions(id, permissions) {
    const actor = await requireActor("users.assign_role");
    const target = requireSamePark(actor, await users.getById(id));
    const optionalPermissions = validateOptionalPermissions(
      target.role,
      permissions,
    );
    const assignedAt = new Date().toISOString();
    return safeUser(
      await users.patch(target.id, {
        optionalPermissions,
        permissionHistory: [
          ...(target.permissionHistory || []),
          {
            previousPermissions: target.optionalPermissions || [],
            permissions: optionalPermissions,
            assignedByUserId: actor.id,
            assignedAt,
          },
        ],
        updatedByUserId: actor.id,
        updatedAt: assignedAt,
      }),
    );
  },
  async assignRole(id, role) {
    const actor = await requireActor("users.assign_role");
    const target = requireSamePark(actor, await users.getById(id));
    checkedRole(role);
    if (String(actor.id) === String(id) && role !== target.role)
      throw new Error("Otro administrador debe cambiar tu rol.");
    return safeUser(
      await users.patch(target.id, {
        role,
        optionalPermissions:
          role === target.role ? target.optionalPermissions || [] : [],
        roleHistory: [
          ...(target.roleHistory || []),
          {
            previousRole: target.role,
            role,
            assignedByUserId: actor.id,
            assignedAt: new Date().toISOString(),
          },
        ],
        updatedByUserId: actor.id,
      }),
    );
  },
};

import { createRepository } from "../repositories/createRepository";
const users = createRepository({ resource: "users" });
import { safeUser, requireActor } from "./sessionAccess";
import {
  hasPermission,
  isActiveUser,
  requirePermission,
} from "../config/permissions";
export const authService = {
  async login({ email, password }) {
    const all = await users.getAll();
    const user = all.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );
    if (!isActiveUser(user))
      throw new Error(
        "Credenciales incorrectas. Verifica tu correo y contraseña.",
      );
    return safeUser(user);
  },
  async updateProfile(id, values) {
    const actor = await requireActor("profile.view");
    requirePermission(
      actor,
      hasPermission(actor, "profile.update_own")
        ? "profile.update_own"
        : "profile.edit",
    );
    if (String(actor.id) !== String(id))
      throw new Error("Solo puedes editar tu propio perfil.");
    return safeUser(
      await users.patch(id, {
        name: values.name,
        department: values.department,
        updatedByUserId: actor.id,
        updatedAt: new Date().toISOString(),
      }),
    );
  },
  async changePassword(id, current, next) {
    const user = await requireActor("profile.view");
    requirePermission(
      user,
      hasPermission(user, "profile.update_own")
        ? "profile.update_own"
        : "profile.edit",
    );
    if (String(user.id) !== String(id))
      throw new Error("Solo puedes modificar tus credenciales.");
    if (user.password !== current)
      throw new Error("La contraseña actual es incorrecta.");
    if (next.length < 8) throw new Error("Utiliza al menos 8 caracteres.");
    await users.patch(id, {
      password: next,
      updatedByUserId: user.id,
      updatedAt: new Date().toISOString(),
    });
  },
};

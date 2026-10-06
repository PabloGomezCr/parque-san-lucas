import { createRepository } from "../repositories/createRepository";
import { readStorage } from "../utils/storage";
import {
  isActiveUser,
  requirePermission,
  samePark,
} from "../config/permissions";
export const sessionKey = "parque-isla-san-lucas-auth";
const users = createRepository({ resource: "users" });
export const safeUser = ({ password: _password, ...user }) => user;
export async function requireActor(permission) {
  const session = readStorage(sessionKey);
  if (!isActiveUser(session))
    throw new Error("La sesión no está activa o no tiene parque asignado.");
  const actor = await users.getById(session.id);
  if (!isActiveUser(actor) || !samePark(session, actor))
    throw new Error("La sesión ya no está activa en este parque.");
  return requirePermission(actor, permission);
}
export function requireSamePark(actor, record) {
  if (!samePark(actor, record))
    throw new Error("El registro no pertenece a tu parque.");
  return record;
}

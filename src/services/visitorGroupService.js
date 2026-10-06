import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark } from "./sessionAccess";
import { samePark } from "../config/permissions";

const groups = createRepository({ resource: "visitorGroups" });
const fields = [
  "quantity",
  "origin",
  "language",
  "groupType",
  "date",
  "time",
  "observations",
];

function groupValues(values) {
  const result = Object.fromEntries(
    fields.filter((field) => values[field] !== undefined).map((field) => [field, values[field]]),
  );
  result.quantity = Number(result.quantity);
  if (!Number.isInteger(result.quantity) || result.quantity < 1)
    throw new Error("La cantidad de visitantes debe ser un entero mayor que cero.");
  for (const field of ["origin", "language", "groupType", "date", "time"])
    if (!String(result[field] || "").trim())
      throw new Error("Completa la procedencia, idioma, tipo, fecha y hora.");
  return result;
}

export const visitorGroupService = {
  async getGroups() {
    const actor = await requireActor("visitor_group.view");
    return (await groups.getAll()).filter(
      (group) =>
        samePark(actor, group) && String(group.guideId) === String(actor.id),
    );
  },
  async createGroup(values) {
    const actor = await requireActor("visitor_group.create");
    return groups.create({
      ...groupValues(values),
      parkId: actor.parkId,
      guideId: actor.id,
      createdByUserId: actor.id,
      createdAt: new Date().toISOString(),
      mock: true,
    });
  },
  async updateGroup(id, values) {
    const actor = await requireActor("visitor_group.update_own");
    const current = requireSamePark(actor, await groups.getById(id));
    if (String(current.guideId) !== String(actor.id))
      throw new Error("Solo puedes actualizar tus propios grupos.");
    return groups.patch(id, {
      ...groupValues({ ...current, ...values }),
      parkId: actor.parkId,
      guideId: actor.id,
      updatedByUserId: actor.id,
      updatedAt: new Date().toISOString(),
    });
  },
};
import { createScopedRepository } from "../repositories/createScopedRepository";
import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark } from "./sessionAccess";
import {
  hasPermission,
  requirePermission,
} from "../config/permissions";
const repository = createScopedRepository({
  permission: "tourist",
  resource: "touristAttentions",
});
const records = createRepository({ resource: "touristAttentions" });

export const touristService = {
  getTourists: () => repository.getAll(),
  getTouristById: (id) => repository.getById(id),
  createTourist: (payload) => repository.create(payload),
  async updateTourist(id, payload) {
    const actor = await requireActor("tourist.view");
    const item = requireSamePark(actor, await records.getById(id));
    if (hasPermission(actor, "tourist.edit"))
      return repository.patch(id, payload);
    requirePermission(actor, "tourist.update_own");
    if (String(item.createdByUserId) !== String(actor.id))
      throw new Error("Solo puedes actualizar tus propios registros.");
    const {
      id: _id,
      parkId: _parkId,
      createdByUserId: _creator,
      createdAt: _createdAt,
      ...values
    } = payload;
    return records.patch(id, {
      ...values,
      parkId: actor.parkId,
      updatedByUserId: actor.id,
      updatedAt: new Date().toISOString(),
    });
  },
  deleteTourist: (id) => repository.remove(id),
};

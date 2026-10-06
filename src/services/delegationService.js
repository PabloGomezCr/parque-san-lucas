import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark } from "./sessionAccess";
import { samePark, requirePermission } from "../config/permissions";
const repositories = {
  tasks: createRepository({ resource: "tasks" }),
  maintenance: createRepository({ resource: "maintenance" }),
};
const users = createRepository({ resource: "users" });
const prefixes = { tasks: "task", maintenance: "maintenance" };
// Serialize writes to the same record in this client, including history appends.
const pending = new Map();
export const delegationService = {
  async delegate(moduleKey, id, userId) {
    const repository = repositories[moduleKey];
    if (!repository) throw new Error("Este módulo no admite delegación.");
    const key = `${moduleKey}/${id}`;
    const previous = pending.get(key) || Promise.resolve();
    const operation = previous
      .catch(() => {})
      .then(async () => {
        const actor = await requireActor(`${prefixes[moduleKey]}.view`);
        const item = requireSamePark(actor, await repository.getById(id));
        requirePermission(
          actor,
          `${prefixes[moduleKey]}.${item.assignedToUserId ? "reassign" : "delegate"}`,
        );
        const target = requireSamePark(actor, await users.getById(userId));
        if (target.active !== true)
          throw new Error(
            "El responsable debe ser un usuario activo del parque.",
          );
        if (String(item.assignedToUserId) === String(target.id))
          throw new Error("Este usuario ya es responsable del registro.");
        const delegatedAt = new Date().toISOString();
        const event = {
          id: crypto.randomUUID(),
          parkId: actor.parkId,
          moduleKey,
          recordId: String(id),
          previousAssignedToUserId: item.assignedToUserId || null,
          assignedToUserId: target.id,
          assignedToName: target.name,
          assignedByUserId: actor.id,
          assignedByName: actor.name,
          delegatedAt,
        };
        return repository.patch(id, {
          assignedToUserId: target.id,
          assignedTo: target.name,
          assignedByUserId: actor.id,
          delegatedAt,
          delegationHistory: [...(item.delegationHistory || []), event],
          updatedByUserId: actor.id,
          updatedAt: delegatedAt,
        });
      });
    pending.set(key, operation);
    try {
      return await operation;
    } finally {
      if (pending.get(key) === operation) pending.delete(key);
    }
  },
  async getHistory(moduleKey, id) {
    const actor = await requireActor("delegation.view_history");
    if (!repositories[moduleKey])
      throw new Error("Este módulo no admite delegación.");
    const item = requireSamePark(
      actor,
      await repositories[moduleKey].getById(id),
    );
    return item.delegationHistory || [];
  },
  async getSummary() {
    const actor = await requireActor("delegation.view_history");
    const collections = await Promise.all(
      Object.entries(repositories).map(async ([moduleKey, repository]) =>
        (await repository.getAll())
          .filter((item) => samePark(actor, item))
          .map((item) => ({ ...item, moduleKey })),
      ),
    );
    const records = collections.flat();
    return {
      assignedToMe: records.filter(
        (item) => String(item.assignedToUserId) === String(actor.id),
      ),
      delegatedByMe: records.filter(
        (item) => String(item.assignedByUserId) === String(actor.id),
      ),
      history: records.flatMap((item) =>
        (item.delegationHistory || []).map((event) => ({
          ...event,
          title: item.title,
        })),
      ),
    };
  },
};

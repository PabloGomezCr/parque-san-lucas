import { createRepository } from "./createRepository";
import { requireActor, requireSamePark } from "../services/sessionAccess";
import {
  samePark,
  requirePermission,
  hasPermission,
} from "../config/permissions";
// Front-end mock checks; JSON Server itself is not a security boundary.
export function createScopedRepository({ resource, permission }) {
  const repository = createRepository({ resource });
  const protect = (body) => {
    const {
      id: _id,
      parkId: _park,
      createdByUserId: _creator,
      createdAt: _created,
      sourceIncidentId: _sourceIncident,
      assignedToUserId: _to,
      assignedByUserId: _by,
      delegatedAt: _at,
      delegationHistory: _history,
      ...values
    } = body;
    return values;
  };
  return {
    async getAll() {
      const actor = await requireActor(`${permission}.view`);
      return (await repository.getAll()).filter((item) =>
        samePark(actor, item),
      );
    },
    async getById(id) {
      const actor = await requireActor(`${permission}.view`);
      return requireSamePark(actor, await repository.getById(id));
    },
    async create(body) {
      const actor = await requireActor(`${permission}.create`);
      if (permission === "task" && body.status === "completed")
        requirePermission(actor, "task.complete");
      if (permission === "heritage" && body.status === "approved")
        requirePermission(actor, "heritage.edit");
      const recordId = crypto.randomUUID();
      let assignment = {};
      if (
        ["task", "maintenance"].includes(permission) &&
        hasPermission(actor, `${permission}.delegate`) &&
        !body.assignedToUserId
      )
        throw new Error("Selecciona un usuario activo del parque.");
      if (
        ["task", "maintenance"].includes(permission) &&
        body.assignedToUserId
      ) {
        requirePermission(actor, `${permission}.delegate`);
        const target = requireSamePark(
          actor,
          await createRepository({ resource: "users" }).getById(
            body.assignedToUserId,
          ),
        );
        if (target.active !== true)
          throw new Error(
            "El responsable debe ser un usuario activo del parque.",
          );
        const delegatedAt = new Date().toISOString();
        assignment = {
          assignedTo: target.name,
          assignedToUserId: target.id,
          assignedByUserId: actor.id,
          delegatedAt,
          delegationHistory: [
            {
              id: crypto.randomUUID(),
              parkId: actor.parkId,
              moduleKey: resource,
              recordId,
              previousAssignedToUserId: null,
              assignedToUserId: target.id,
              assignedToName: target.name,
              assignedByUserId: actor.id,
              assignedByName: actor.name,
              delegatedAt,
            },
          ],
        };
      }
      return repository.create({
        ...protect(body),
        ...assignment,
        id: recordId,
        parkId: actor.parkId,
        createdByUserId: actor.id,
        updatedByUserId: actor.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mock: true,
      });
    },
    async patch(id, body) {
      const onlyCompletion =
        body.status === "completed" &&
        Object.keys(body).every((key) => ["status", "updatedAt"].includes(key));
      const actor = await requireActor(
        `${permission}.${onlyCompletion && permission === "task" ? "complete" : "edit"}`,
      );
      const item = requireSamePark(actor, await repository.getById(id));
      if (
        permission === "task" &&
        body.status === "completed" &&
        item.status !== "completed"
      )
        requirePermission(actor, "task.complete");
      const values = protect(body);
      // Delegated responsibility is changed exclusively through delegationService.
      if (
        item.assignedToUserId ||
        hasPermission(actor, `${permission}.reassign`)
      )
        delete values.assignedTo;
      return repository.patch(id, {
        ...values,
        parkId: actor.parkId,
        updatedByUserId: actor.id,
        updatedAt: new Date().toISOString(),
      });
    },
    async remove(id) {
      const actor = await requireActor(`${permission}.delete`);
      requireSamePark(actor, await repository.getById(id));
      return repository.remove(id);
    },
  };
}

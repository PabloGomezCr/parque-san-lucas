import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark } from "./sessionAccess";
import { samePark, requirePermission } from "../config/permissions";
const incidents = createRepository({ resource: "incidents" });
const targets = {
  tasks: createRepository({ resource: "tasks" }),
  maintenance: createRepository({ resource: "maintenance" }),
};
const pending = new Map();
async function serialize(id, action) {
  const previous = pending.get(String(id)) || Promise.resolve();
  const operation = previous.catch(() => {}).then(action);
  pending.set(String(id), operation);
  try {
    return await operation;
  } finally {
    if (pending.get(String(id)) === operation) pending.delete(String(id));
  }
}
export const incidentService = {
  async getOwnIncidents() {
    const actor = await requireActor("incident.view_own");
    return (await incidents.getAll()).filter(
      (item) =>
        samePark(actor, item) &&
        String(item.reportedByUserId) === String(actor.id),
    );
  },
  async createIncident(values) {
    const actor = await requireActor("incident.create");
    const title = values.title?.trim();
    const description = values.description?.trim();
    if (!title || !description)
      throw new Error("Escribe un título y una descripción del reporte.");
    const reportedAt = new Date().toISOString();
    return incidents.create({
      title,
      description,
      category: String(values.category || "situacion_operativa"),
      location: String(values.location || "").trim(),
      status: "received",
      parkId: actor.parkId,
      reportedByUserId: actor.id,
      reportedByName: actor.name,
      reportedAt,
      history: [
        {
          action: "reported",
          actorUserId: actor.id,
          actorName: actor.name,
          at: reportedAt,
        },
      ],
      mock: true,
    });
  },
  async getIncidents() {
    const actor = await requireActor("incident.view");
    return (await incidents.getAll()).filter((item) => samePark(actor, item));
  },
  async getIncidentById(id) {
    const actor = await requireActor("incident.view");
    return requireSamePark(actor, await incidents.getById(id));
  },
  async markReviewed(id) {
    return serialize(id, async () => {
      const actor = await requireActor("incident.manage");
      const item = requireSamePark(actor, await incidents.getById(id));
      if (item.status === "reviewed" || item.status === "converted")
        return item;
      const reviewedAt = new Date().toISOString();
      return incidents.patch(id, {
        status: "reviewed",
        reviewedByUserId: actor.id,
        reviewedAt,
        history: [
          ...(item.history || []),
          {
            action: "reviewed",
            actorUserId: actor.id,
            actorName: actor.name,
            at: reviewedAt,
          },
        ],
      });
    });
  },
  async convert(id, moduleKey) {
    if (!targets[moduleKey])
      throw new Error("Convierte la incidencia en tarea o mantenimiento.");
    return serialize(id, async () => {
      const actor = await requireActor("incident.manage");
      requirePermission(
        actor,
        moduleKey === "tasks" ? "task.create" : "maintenance.create",
      );
      const item = requireSamePark(actor, await incidents.getById(id));
      if (item.convertedRecord) {
        if (item.convertedRecord.moduleKey !== moduleKey)
          throw new Error("La incidencia ya fue convertida en otro módulo.");
        requireSamePark(
          actor,
          await targets[moduleKey].getById(item.convertedRecord.id),
        );
        return item.convertedRecord;
      }
      // Recover a successful POST followed by a failed incident PATCH, without a second record.
      const existing = (
        await Promise.all(
          Object.entries(targets).map(async ([key, repository]) =>
            (await repository.getAll())
              .filter(
                (record) =>
                  samePark(actor, record) &&
                  String(record.sourceIncidentId) === String(id),
              )
              .map((record) => ({ moduleKey: key, record })),
          ),
        )
      ).flat();
      if (existing.length > 1)
        throw new Error(
          "Hay más de un registro vinculado; revisa la incidencia antes de continuar.",
        );
      if (existing[0] && existing[0].moduleKey !== moduleKey)
        throw new Error("La incidencia ya tiene un registro en otro módulo.");
      const createdAt = new Date().toISOString();
      const date = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Costa_Rica",
      });
      const record =
        existing[0]?.record ||
        (await targets[moduleKey].create({
          id: `incident-${id}`,
          parkId: actor.parkId,
          sourceIncidentId: String(id),
          title: `Atender incidencia #${id}`,
          status: moduleKey === "tasks" ? "pending" : "planned",
          category:
            moduleKey === "tasks" ? "Senderos y Vigilancia" : "Infraestructura",
          priority: "medium",
          ...(moduleKey === "tasks" ? { dueDate: date } : { date }),
          assignedTo: actor.name,
          assignedToUserId: actor.id,
          createdByUserId: actor.id,
          createdByName: actor.name,
          createdAt,
          updatedAt: createdAt,
          mock: true,
        }));
      const relation = { moduleKey, id: record.id };
      await incidents.patch(id, {
        status: "converted",
        convertedRecord: relation,
        convertedByUserId: record.createdByUserId,
        convertedAt: record.createdAt,
        history: [
          ...(item.history || []),
          {
            action: "converted",
            actorUserId: record.createdByUserId,
            actorName: record.createdByName,
            at: record.createdAt,
            record: relation,
          },
        ],
      });
      return relation;
    });
  },
};

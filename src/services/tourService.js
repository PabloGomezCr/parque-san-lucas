import { createRepository } from "../repositories/createRepository";
import { requireActor, requireSamePark } from "./sessionAccess";
import { samePark } from "../config/permissions";

const tours = createRepository({ resource: "tours" });
const routes = createRepository({ resource: "parkRoutes" });
const groups = createRepository({ resource: "visitorGroups" });
const statuses = ["scheduled", "in_progress", "completed", "cancelled"];
const fields = [
  "date",
  "startTime",
  "endTime",
  "routeId",
  "groupId",
  "status",
  "notes",
];

async function checkReferences(actor, values) {
  if (values.routeId) {
    const route = requireSamePark(actor, await routes.getById(values.routeId));
    if (route.active === false) throw new Error("La ruta no está disponible.");
  }
  if (values.groupId) {
    const group = requireSamePark(actor, await groups.getById(values.groupId));
    if (String(group.guideId) !== String(actor.id))
      throw new Error("El grupo no pertenece a tus registros.");
  }
}

function editableValues(values) {
  return Object.fromEntries(
    fields.filter((field) => values[field] !== undefined).map((field) => [field, values[field]]),
  );
}

function validateTour(values) {
  if (!values.date || !values.startTime || !values.endTime || !values.routeId)
    throw new Error("Completa la fecha, horario y recorrido.");
  if (values.endTime <= values.startTime)
    throw new Error("La hora de finalización debe ser posterior al inicio.");
  if (!statuses.includes(values.status || "scheduled"))
    throw new Error("El estado del recorrido no es válido.");
}

export const tourService = {
  async getTours() {
    const actor = await requireActor("tour.view");
    return (await tours.getAll()).filter(
      (tour) =>
        samePark(actor, tour) && String(tour.guideId) === String(actor.id),
    );
  },
  async getRoutes() {
    const actor = await requireActor("routes.view");
    return (await routes.getAll()).filter(
      (route) => samePark(actor, route) && route.active !== false,
    );
  },
  async createTour(values) {
    const actor = await requireActor("tour.create");
    const tour = {
      ...editableValues({ ...values, status: values.status || "scheduled" }),
      parkId: actor.parkId,
      guideId: actor.id,
      createdByUserId: actor.id,
      createdAt: new Date().toISOString(),
      mock: true,
    };
    validateTour(tour);
    await checkReferences(actor, tour);
    return tours.create(tour);
  },
  async updateTour(id, values) {
    const actor = await requireActor("tour.update_own");
    const current = requireSamePark(actor, await tours.getById(id));
    if (String(current.guideId) !== String(actor.id))
      throw new Error("Solo puedes actualizar tus propios recorridos.");
    const changes = editableValues(values);
    const updated = { ...current, ...changes };
    validateTour(updated);
    await checkReferences(actor, updated);
    return tours.patch(id, {
      ...changes,
      parkId: actor.parkId,
      guideId: actor.id,
      updatedByUserId: actor.id,
      updatedAt: new Date().toISOString(),
    });
  },
};
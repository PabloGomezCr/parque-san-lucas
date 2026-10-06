import { apiClient } from "../../services/apiClient";
import { writeStorage } from "../../utils/storage";
import { sessionKey } from "../../services/sessionAccess";
import {
  masterActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../fixtures/admin";
// In-memory HTTP boundary; exercise real services/repositories and RBAC checks.
export function mockJsonServer(extra = {}, actor = masterActor) {
  const db = structuredClone({
    users: [masterActor, parkWorker, foreignWorker, inactiveWorker],
    tasks: [],
    incidents: [],
    maintenance: [],
    chatMessages: [],
    chatChannels: [
      {
        id: "san-lucas-group",
        parkId: "1",
        kind: "group",
        name: "Parque Nacional Isla San Lucas",
        active: true,
      },
    ],
    chatChannelMembers: [],
    directConversations: [],
    species: [],
    speciesObservations: [],
    touristAttentions: [],
    tours: [],
    visitorGroups: [],
    parkRoutes: [],
    parks: [],
    heritageInterventions: [],
    wellReadings: [],
    ...extra,
  });
  writeStorage(sessionKey, actor);
  apiClient.mockImplementation(async (path, { method = "GET", body } = {}) => {
    const [, resource, encodedId] = path.split("/");
    const id = encodedId && decodeURIComponent(encodedId);
    const collection = db[resource];
    if (!collection) throw new Error("Colección no encontrada");
    if (method === "GET" && !id) return structuredClone(collection);
    const index = collection.findIndex(
      (item) => String(item.id) === String(id),
    );
    if (method === "POST") {
      const result = { ...body, id: body.id || crypto.randomUUID() };
      collection.push(structuredClone(result));
      return structuredClone(result);
    }
    if (index < 0) throw new Error("El registro solicitado no existe.");
    if (method === "PATCH")
      collection[index] = { ...collection[index], ...structuredClone(body) };
    if (method === "DELETE") return collection.splice(index, 1)[0];
    return structuredClone(collection[index]);
  });
  return db;
}
export const writes = () =>
  apiClient.mock.calls.filter(
    ([, options]) => options?.method && options.method !== "GET",
  );

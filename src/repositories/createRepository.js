import { apiClient } from "../services/apiClient";
export function createRepository({ resource }) {
  const path = `/${resource}`;
  const itemPath = (id) => `${path}/${encodeURIComponent(id)}`;
  return {
    getAll: () => apiClient(path),
    getById: (id) => apiClient(itemPath(id)),
    create: (body) => apiClient(path, { method: "POST", body }),
    update: (id, body) => apiClient(itemPath(id), { method: "PUT", body }),
    patch: (id, body) => apiClient(itemPath(id), { method: "PATCH", body }),
    remove: (id) => apiClient(itemPath(id), { method: "DELETE" }),
  };
}

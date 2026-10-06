import { createScopedRepository } from "../repositories/createScopedRepository";
const repository = createScopedRepository({
  permission: "maintenance",
  resource: "maintenance",
});

export const maintenanceService = {
  getMaintenance: () => repository.getAll(),
  getMaintenanceById: (id) => repository.getById(id),
  createMaintenance: (payload) => repository.create(payload),
  updateMaintenance: (id, payload) => repository.patch(id, payload),
  deleteMaintenance: (id) => repository.remove(id),
};

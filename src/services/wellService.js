import { createScopedRepository } from "../repositories/createScopedRepository";
const repository = createScopedRepository({
  permission: "well",
  resource: "wellReadings",
});

export const wellService = {
  getReadings: () => repository.getAll(),
  getReadingById: (id) => repository.getById(id),
  createReading: (payload) => repository.create(payload),
  updateReading: (id, payload) => repository.patch(id, payload),
  deleteReading: (id) => repository.remove(id),
};

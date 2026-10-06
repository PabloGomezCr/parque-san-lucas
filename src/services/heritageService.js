import { createScopedRepository } from "../repositories/createScopedRepository";
const repository = createScopedRepository({
  permission: "heritage",
  resource: "heritageInterventions",
});

export const heritageService = {
  getHeritage: () => repository.getAll(),
  getHeritageById: (id) => repository.getById(id),
  createHeritage: (payload) => repository.create(payload),
  updateHeritage: (id, payload) => repository.patch(id, payload),
  deleteHeritage: (id) => repository.remove(id),
};

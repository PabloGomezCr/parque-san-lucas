import { createScopedRepository } from "../repositories/createScopedRepository";
const repository = createScopedRepository({
  permission: "species",
  resource: "species",
});

const observations = createScopedRepository({
  permission: "species.observation",
  resource: "speciesObservations",
});

// Observation reads follow species.view; writes have a separate permission.
const observationReader = createScopedRepository({
  resource: "speciesObservations",
  permission: "species",
});
const getScopedObservations = () => observationReader.getAll();
export const speciesService = {
  getSpecies: () => repository.getAll(),
  getSpeciesById: (id) => repository.getById(id),
  createSpecies: (payload) => repository.create(payload),
  updateSpecies: (id, payload) => repository.patch(id, payload),
  deleteSpecies: (id) => repository.remove(id),
  getObservations: () => getScopedObservations(),
  createObservation: async (payload) => {
    await repository.getById(payload.speciesId);
    return observations.create(payload);
  },
};

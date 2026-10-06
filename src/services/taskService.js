import { createScopedRepository } from "../repositories/createScopedRepository";
const repository = createScopedRepository({
  permission: "task",
  resource: "tasks",
});

export const taskService = {
  getTasks: () => repository.getAll(),
  getTaskById: (id) => repository.getById(id),
  createTask: (payload) => repository.create(payload),
  updateTask: (id, payload) => repository.patch(id, payload),
  deleteTask: (id) => repository.remove(id),
};

import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { delegationService } from "./delegationService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import {
  masterActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../test/fixtures/admin";
const task = { id: "task-1", parkId: "1", title: "Tarea ficticia" };
describe("delegationService: MASTER_ADMIN", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer({
      tasks: [task, { ...task, id: "foreign-task", parkId: "2" }],
      maintenance: [{ ...task, id: "maintenance-1" }],
    });
  });
  it.each([
    ["tasks", "task-1"],
    ["maintenance", "maintenance-1"],
  ])("delega %s con actor, parque y fecha trazables", async (moduleKey, id) => {
    const result = await delegationService.delegate(
      moduleKey,
      id,
      parkWorker.id,
    );
    expect(result).toMatchObject({
      assignedToUserId: parkWorker.id,
      assignedByUserId: masterActor.id,
      parkId: masterActor.parkId,
    });
    expect(result.delegatedAt).toEqual(expect.any(String));
    expect(result.delegationHistory).toEqual([
      expect.objectContaining({
        assignedToUserId: parkWorker.id,
        assignedByUserId: masterActor.id,
        assignedByName: masterActor.name,
        previousAssignedToUserId: null,
        moduleKey,
        recordId: id,
      }),
    ]);
  });
  it("reasigna sin perder historial y consulta quién delegó cada acción", async () => {
    await delegationService.delegate("tasks", "task-1", parkWorker.id);
    const first = structuredClone(db.tasks[0].delegationHistory[0]);
    await delegationService.delegate("tasks", "task-1", masterActor.id);
    const history = await delegationService.getHistory("tasks", "task-1");
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(first);
    expect(history[1]).toMatchObject({
      previousAssignedToUserId: parkWorker.id,
      assignedToUserId: masterActor.id,
      assignedByUserId: masterActor.id,
    });
  });
  it("serializa dos cambios simultáneos sin perder eventos del mismo cliente", async () => {
    await Promise.all([
      delegationService.delegate("tasks", "task-1", parkWorker.id),
      delegationService.delegate("tasks", "task-1", masterActor.id),
    ]);
    expect(db.tasks[0].delegationHistory).toHaveLength(2);
  });
  it.each([foreignWorker.id, inactiveWorker.id])(
    "rechaza delegación a usuario ajeno o inactivo: %s",
    async (id) => {
      await expect(
        delegationService.delegate("tasks", "task-1", id),
      ).rejects.toThrow();
      expect(writes()).toHaveLength(0);
    },
  );
  it("rechaza registro e historial de otro parque", async () => {
    await expect(
      delegationService.delegate("tasks", "foreign-task", parkWorker.id),
    ).rejects.toThrow("no pertenece");
    await expect(
      delegationService.getHistory("tasks", "foreign-task"),
    ).rejects.toThrow("no pertenece");
    expect(writes()).toHaveLength(0);
  });
  it("rechaza a un usuario cuya cuenta fue desactivada después de iniciar sesión", async () => {
    db.users[0].active = false;
    await expect(
      delegationService.delegate("tasks", "task-1", parkWorker.id),
    ).rejects.toThrow("ya no está activa");
    expect(writes()).toHaveLength(0);
  });
  it("conserva las restricciones del rol existente", async () => {
    mockJsonServer({ tasks: [task] }, parkWorker);
    await expect(
      delegationService.delegate("tasks", "task-1", masterActor.id),
    ).rejects.toThrow("No tienes permiso");
    expect(writes()).toHaveLength(0);
  });
  it("resume asignaciones actuales, delegaciones propias e historial solo del parque", async () => {
    await delegationService.delegate("tasks", "task-1", masterActor.id);
    const data = await delegationService.getSummary();
    expect(data.assignedToMe).toHaveLength(1);
    expect(data.delegatedByMe).toHaveLength(1);
    expect(data.history).toHaveLength(1);
    expect(data.history[0]).toMatchObject({
      title: task.title,
      recordId: task.id,
    });
  });
});

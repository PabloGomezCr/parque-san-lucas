import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../services/taskService");
vi.unmock("../services/wellService");
import { taskService } from "../services/taskService";
import { wellService } from "../services/wellService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import { masterActor, parkWorker, foreignWorker } from "../test/fixtures/admin";
describe("Repositorios acotados al parque y al permiso", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer({
      tasks: [
        {
          id: "own",
          parkId: "1",
          title: "Propia",
          delegationHistory: [{ id: "original" }],
        },
        { id: "foreign", parkId: "2", title: "Ajena" },
      ],
    });
  });
  it("filtra listados y rechaza detalle y edición de otro parque", async () => {
    expect((await taskService.getTasks()).map((item) => item.id)).toEqual([
      "own",
    ]);
    await expect(taskService.getTaskById("foreign")).rejects.toThrow(
      "no pertenece",
    );
    await expect(
      taskService.updateTask("foreign", { title: "Intento" }),
    ).rejects.toThrow("no pertenece");
    expect(writes()).toHaveLength(0);
  });
  it("crea asignación trazable a usuario activo del mismo parque", async () => {
    const result = await taskService.createTask({
      title: "Nueva",
      assignedToUserId: parkWorker.id,
      assignedByUserId: "falso",
      parkId: "2",
      delegationHistory: [],
    });
    expect(result).toMatchObject({
      parkId: "1",
      assignedToUserId: parkWorker.id,
      assignedByUserId: masterActor.id,
      createdByUserId: masterActor.id,
    });
    expect(result.delegationHistory[0]).toMatchObject({
      recordId: result.id,
      assignedByName: masterActor.name,
    });
  });
  it("rechaza responsabilidad de otro parque al crear", async () => {
    await expect(
      taskService.createTask({ assignedToUserId: foreignWorker.id }),
    ).rejects.toThrow("no pertenece");
    expect(writes()).toHaveLength(0);
  });
  it("impide falsificar asignaciones, parque e historial mediante edición genérica", async () => {
    await taskService.updateTask("own", {
      title: "Editada",
      parkId: "2",
      assignedToUserId: foreignWorker.id,
      delegationHistory: [],
      assignedByUserId: "falso",
      assignedTo: "Falso",
    });
    expect(db.tasks[0]).toMatchObject({
      title: "Editada",
      parkId: "1",
      delegationHistory: [{ id: "original" }],
      updatedByUserId: masterActor.id,
    });
    expect(db.tasks[0]).not.toHaveProperty("assignedToUserId");
    expect(db.tasks[0]).not.toHaveProperty("assignedTo");
  });
  it("no concede eliminación ni escritura del pozo a MASTER_ADMIN", async () => {
    await expect(taskService.deleteTask("own")).rejects.toThrow(
      "No tienes permiso",
    );
    await expect(wellService.createReading({ level: 3 })).rejects.toThrow(
      "No tienes permiso",
    );
    expect(writes()).toHaveLength(0);
  });
  it("mantiene la creación y eliminación previamente disponibles al Supervisor", async () => {
    mockJsonServer({ tasks: [{ id: "own", parkId: "1" }] }, parkWorker);
    const result = await taskService.createTask({
      title: "Legado",
      assignedTo: "Nombre legado",
    });
    expect(result.assignedTo).toBe("Nombre legado");
    await taskService.deleteTask("own");
  });
});

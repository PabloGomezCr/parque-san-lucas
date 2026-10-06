import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("./taskService");
vi.unmock("./maintenanceService");
vi.unmock("./heritageService");
vi.unmock("./speciesService");
vi.unmock("./touristService");
vi.unmock("./wellService");
import { taskService } from "./taskService";
import { speciesService } from "./speciesService";
import { heritageService } from "./heritageService";
import { userService } from "./userService";
import { delegationService } from "./delegationService";
import { chatService } from "./chatService";
import { mockJsonServer } from "../test/mocks/jsonServer";
import { rangerActor, masterActor, parkWorker } from "../test/fixtures/admin";
describe("PARK_RANGER: servicios de campo", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer(
      {
        users: [rangerActor, masterActor, parkWorker],
        tasks: [{ id: "task-1", parkId: "1", status: "pending" }],
        maintenance: [{ id: "maintenance-1", parkId: "1" }],
      },
      rangerActor,
    );
  });
  it("registra y completa tarea sin concederse delegación", async () => {
    const record = await taskService.createTask({
      title: "Tarea de campo",
      status: "pending",
      assignedTo: rangerActor.name,
    });
    const result = await taskService.updateTask(record.id, {
      status: "completed",
    });
    expect(result.status).toBe("completed");
    expect(result.updatedByUserId).toBe(rangerActor.id);
  });
  it("registra, edita especie y agrega observación vinculada", async () => {
    const record = await speciesService.createSpecies({
      commonName: "Especie ficticia",
    });
    await speciesService.updateSpecies(record.id, {
      commonName: "Ficha editada",
    });
    const observation = await speciesService.createObservation({
      speciesId: record.id,
      comment: "Observación ficticia",
    });
    expect(observation.parkId).toBe("1");
    expect(db.species[0].commonName).toBe("Ficha editada");
  });
  it("registra intervención sin autorizarla y rechaza estado aprobado", async () => {
    const record = await heritageService.createHeritage({
      site: "Elemento ficticio",
      status: "pending",
    });
    expect(record.status).toBe("pending");
    await expect(
      heritageService.createHeritage({ site: "Intento", status: "approved" }),
    ).rejects.toThrow("No tienes permiso");
  });
  it("no administra usuarios ni asigna roles", async () => {
    await expect(userService.getUsers()).rejects.toThrow("No tienes permiso");
    await expect(
      userService.assignRole(parkWorker.id, "MASTER_ADMIN"),
    ).rejects.toThrow("No tienes permiso");
  });
  it.each([
    ["tasks", "task-1", "task.delegate"],
    ["maintenance", "maintenance-1", "maintenance.delegate"],
  ])(
    "delega %s solo al recibir opcional",
    async (moduleKey, id, permission) => {
      await expect(
        delegationService.delegate(moduleKey, id, parkWorker.id),
      ).rejects.toThrow("No tienes permiso");
      db.users[0].optionalPermissions = [permission];
      expect(
        await delegationService.delegate(moduleKey, id, parkWorker.id),
      ).toMatchObject({ assignedByUserId: rangerActor.id });
    },
  );
  it("participa en grupo y solo usa directo si se asigna permiso", async () => {
    const message = await chatService.sendMessage({
      kind: "group",
      text: "Reporte de campo ficticio",
    });
    expect(await chatService.getMessages("group")).toEqual([
      expect.objectContaining(message),
    ]);
    await expect(
      chatService.sendMessage({
        kind: "direct",
        recipientUserId: masterActor.id,
        text: "Prueba",
      }),
    ).rejects.toThrow("No tienes permiso");
    db.users[0].optionalPermissions = ["chat.direct_admin"];
    expect(
      await chatService.sendMessage({
        kind: "direct",
        recipientUserId: masterActor.id,
        text: "Coordinación",
      }),
    ).toMatchObject({ parkId: "1", senderUserId: rangerActor.id });
  });
});

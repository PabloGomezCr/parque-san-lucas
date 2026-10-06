import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("./taskService");
vi.unmock("./maintenanceService");
vi.unmock("./touristService");
vi.unmock("./heritageService");
vi.unmock("./speciesService");
vi.unmock("./wellService");
import { apiClient } from "./apiClient";
import { delegationService } from "./delegationService";
import { userService } from "./userService";
import { reportService } from "./reportService";
import { taskService } from "./taskService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import {
  adminActor,
  masterActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../test/fixtures/admin";
import { writeStorage } from "../utils/storage";
import { sessionKey } from "./sessionAccess";
describe("ADMIN: servicios reales y permisos asignables", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer(
      {
        users: [
          masterActor,
          adminActor,
          parkWorker,
          foreignWorker,
          inactiveWorker,
        ],
        tasks: [
          { id: "own", parkId: "1", title: "Tarea propia" },
          { id: "foreign", parkId: "2", title: "Tarea ajena" },
        ],
        maintenance: [
          { id: "maintenance-1", parkId: "1", title: "Mantenimiento propio" },
        ],
      },
      adminActor,
    );
  });
  it.each([
    ["tasks", "own"],
    ["maintenance", "maintenance-1"],
  ])("sin permiso no delega %s", async (moduleKey, id) => {
    await expect(
      delegationService.delegate(moduleKey, id, parkWorker.id),
    ).rejects.toThrow("No tienes permiso");
    expect(writes()).toHaveLength(0);
  });
  it.each([
    ["tasks", "own", "task.delegate"],
    ["maintenance", "maintenance-1", "maintenance.delegate"],
  ])(
    "con permiso opcional delega %s con trazabilidad",
    async (moduleKey, id, permission) => {
      db.users.find((user) => user.id === adminActor.id).optionalPermissions = [
        permission,
      ];
      const result = await delegationService.delegate(
        moduleKey,
        id,
        parkWorker.id,
      );
      expect(result).toMatchObject({
        parkId: "1",
        assignedToUserId: parkWorker.id,
        assignedByUserId: adminActor.id,
      });
      expect(result.delegationHistory).toHaveLength(1);
    },
  );
  it("revocar el permiso invalida la sesión anterior y no permite reasignar", async () => {
    const actor = db.users.find((user) => user.id === adminActor.id);
    actor.optionalPermissions = ["task.delegate"];
    await delegationService.delegate("tasks", "own", parkWorker.id);
    await expect(
      delegationService.delegate("tasks", "own", masterActor.id),
    ).rejects.toThrow("No tienes permiso");
    db.tasks.push({ id: "second", parkId: "1", title: "Sin delegar" });
    actor.optionalPermissions = [];
    await expect(
      delegationService.delegate("tasks", "second", parkWorker.id),
    ).rejects.toThrow("No tienes permiso");
    actor.optionalPermissions = ["task.delegate"];
    await expect(
      delegationService.delegate("tasks", "second", parkWorker.id),
    ).resolves.toMatchObject({ assignedByUserId: adminActor.id });
  });
  it("no asigna roles ni permisos a sí mismo aunque tenga users.edit", async () => {
    db.users.find((user) => user.id === adminActor.id).optionalPermissions = [
      "users.view",
      "users.edit",
    ];
    await expect(
      userService.assignRole(parkWorker.id, "MASTER_ADMIN"),
    ).rejects.toThrow("No tienes permiso");
    await expect(
      userService.assignOptionalPermissions(adminActor.id, ["task.delegate"]),
    ).rejects.toThrow("No tienes permiso");
    const result = await userService.updateUser(adminActor.id, {
      ...adminActor,
      role: "MASTER_ADMIN",
      optionalPermissions: ["task.delegate"],
    });
    expect(result.role).toBe("ADMIN");
    expect(result.optionalPermissions).toEqual(["users.view", "users.edit"]);
  });
  it("el Maestro concede y revoca solo opcionales autorizados dejando historial", async () => {
    writeStorage(sessionKey, masterActor);
    await userService.assignOptionalPermissions(adminActor.id, [
      "task.delegate",
      "reports.export",
    ]);
    const result = await userService.assignOptionalPermissions(
      adminActor.id,
      [],
    );
    expect(result.optionalPermissions).toEqual([]);
    expect(result.permissionHistory).toHaveLength(2);
    expect(result.permissionHistory[0]).toMatchObject({
      assignedByUserId: masterActor.id,
      permissions: ["task.delegate", "reports.export"],
    });
    await expect(
      userService.assignOptionalPermissions(adminActor.id, [
        "users.assign_role",
      ]),
    ).rejects.toThrow("no permitidos");
    await expect(
      userService.assignOptionalPermissions(foreignWorker.id, [
        "task.delegate",
      ]),
    ).rejects.toThrow("no pertenece");
  });
  it("consulta dashboard y reportes sin pedir well.view y sin datos de otro parque", async () => {
    const result = await reportService.getDashboardData(adminActor);
    expect(result.tasks.map((task) => task.id)).toEqual(["own"]);
    expect(result.wellReadings).toEqual([]);
    expect(
      apiClient.mock.calls.some(([path]) => path === "/wellReadings"),
    ).toBe(false);
  });
  it("rechaza finalización de tarea durante create y edit sin task.complete", async () => {
    await expect(
      taskService.createTask({ title: "Intento", status: "completed" }),
    ).rejects.toThrow("No tienes permiso");
    await expect(
      taskService.updateTask("own", { title: "Intento", status: "completed" }),
    ).rejects.toThrow("No tienes permiso");
    expect(writes()).toHaveLength(0);
  });
  it("cambio de rol limpia los opcionales sin modificar permisos de otros roles", async () => {
    writeStorage(sessionKey, masterActor);
    await userService.assignOptionalPermissions(adminActor.id, [
      "task.delegate",
    ]);
    const result = await userService.assignRole(adminActor.id, "Supervisor");
    expect(result.optionalPermissions).toEqual([]);
  });
  it("crea ADMIN con opcionales autorizados e impide permisos no permitidos", async () => {
    writeStorage(sessionKey, masterActor);
    const values = {
      name: "Nuevo Administrador",
      email: "nuevo-admin@example.test",
      password: "clave-ficticia",
      role: "ADMIN",
      optionalPermissions: ["maintenance.delegate"],
    };
    const result = await userService.createUser(values);
    expect(result.optionalPermissions).toEqual(["maintenance.delegate"]);
    await expect(
      userService.createUser({
        ...values,
        email: "otro@example.test",
        optionalPermissions: ["users.assign_role"],
      }),
    ).rejects.toThrow("no permitidos");
  });
});

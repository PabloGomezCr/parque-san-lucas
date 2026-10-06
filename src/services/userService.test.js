import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { userService } from "./userService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import { masterActor, parkWorker, foreignWorker } from "../test/fixtures/admin";
describe("userService: MASTER_ADMIN", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer();
  });
  it("lista usuarios del parque sin contraseñas y delega solo a activos", async () => {
    const users = await userService.getUsers();
    expect(users).toHaveLength(3);
    expect(
      users.every((user) => user.parkId === "1" && !("password" in user)),
    ).toBe(true);
    const eligible = await userService.getEligibleUsers("task.delegate");
    expect(eligible.map((user) => user.id)).toEqual([
      masterActor.id,
      parkWorker.id,
    ]);
  });
  it("crea usuario con parque y auditoría del actor ignorando parque enviado", async () => {
    const result = await userService.createUser({
      name: "Nueva Persona",
      email: "nueva@example.test",
      password: "clave-ficticia",
      role: "Supervisor",
      parkId: "2",
      active: false,
    });
    expect(result).toMatchObject({
      parkId: "1",
      active: true,
      createdByUserId: masterActor.id,
      role: "Supervisor",
    });
    expect(result).not.toHaveProperty("password");
  });
  it("edita y desactiva usuarios propios sin cambiar rol o parque desde el formulario", async () => {
    const result = await userService.updateUser(parkWorker.id, {
      ...parkWorker,
      name: "Nombre Editado",
      active: false,
      role: "MASTER_ADMIN",
      parkId: "2",
    });
    expect(result).toMatchObject({
      name: "Nombre Editado",
      active: false,
      role: "Supervisor",
      parkId: "1",
      updatedByUserId: masterActor.id,
    });
  });
  it("asigna un rol permitido y conserva historial de roles", async () => {
    const result = await userService.assignRole(parkWorker.id, "MASTER_ADMIN");
    expect(result.role).toBe("MASTER_ADMIN");
    expect(result.roleHistory[0]).toMatchObject({
      previousRole: "Supervisor",
      role: "MASTER_ADMIN",
      assignedByUserId: masterActor.id,
    });
    await userService.assignRole(parkWorker.id, "Supervisor");
    expect(
      db.users.find((user) => user.id === parkWorker.id).roleHistory,
    ).toHaveLength(2);
  });
  it("rechaza roles no definidos y correo duplicado", async () => {
    await expect(
      userService.assignRole(parkWorker.id, "NATIONAL_ADMIN"),
    ).rejects.toThrow("no está permitido");
    await expect(userService.createUser({ ...parkWorker })).rejects.toThrow(
      "correo ya está registrado",
    );
    expect(writes()).toHaveLength(0);
  });
  it("impide consultar, editar o asignar roles a usuarios de otro parque", async () => {
    await expect(userService.getUserById(foreignWorker.id)).rejects.toThrow(
      "no pertenece",
    );
    await expect(
      userService.updateUser(foreignWorker.id, foreignWorker),
    ).rejects.toThrow("no pertenece");
    await expect(
      userService.assignRole(foreignWorker.id, "MASTER_ADMIN"),
    ).rejects.toThrow("no pertenece");
    expect(writes()).toHaveLength(0);
  });
  it("impide desactivar la propia sesión o degradar el propio rol", async () => {
    await expect(
      userService.updateUser(masterActor.id, { ...masterActor, active: false }),
    ).rejects.toThrow("propia sesión");
    await expect(
      userService.assignRole(masterActor.id, "Supervisor"),
    ).rejects.toThrow("Otro administrador");
    expect(writes()).toHaveLength(0);
  });
});

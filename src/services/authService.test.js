import { describe, it, expect, vi } from "vitest";
vi.unmock("./authService");
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { authService } from "./authService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import {
  masterActor,
  inactiveWorker,
  foreignWorker,
} from "../test/fixtures/admin";
describe("authService: sesión activa y perfil propio", () => {
  it("autentica MASTER_ADMIN con parque y sin exponer contraseña", async () => {
    mockJsonServer();
    const result = await authService.login({
      email: masterActor.email,
      password: masterActor.password,
    });
    expect(result).toMatchObject({
      role: "MASTER_ADMIN",
      active: true,
      parkId: "1",
    });
    expect(result).not.toHaveProperty("password");
  });
  it("rechaza login de usuario inactivo", async () => {
    mockJsonServer();
    await expect(
      authService.login({
        email: inactiveWorker.email,
        password: inactiveWorker.password,
      }),
    ).rejects.toThrow("Credenciales incorrectas");
  });
  it("limita el perfil al actor y no permite cambiar rol, actividad o parque", async () => {
    mockJsonServer();
    const result = await authService.updateProfile(masterActor.id, {
      name: "Nombre Editado",
      department: "Pruebas",
      role: "Supervisor",
      parkId: "2",
      active: false,
    });
    expect(result).toMatchObject({
      name: "Nombre Editado",
      role: "MASTER_ADMIN",
      parkId: "1",
      active: true,
    });
  });
  it("rechaza editar perfil o contraseña de otro usuario", async () => {
    mockJsonServer();
    await expect(
      authService.updateProfile(foreignWorker.id, { name: "Intento" }),
    ).rejects.toThrow("propio perfil");
    await expect(
      authService.changePassword(
        foreignWorker.id,
        masterActor.password,
        "nueva-clave",
      ),
    ).rejects.toThrow("tus credenciales");
    expect(writes()).toHaveLength(0);
  });
});

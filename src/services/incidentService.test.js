import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { apiClient } from "./apiClient";
import { incidentService } from "./incidentService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import { rangerActor, masterActor, parkWorker } from "../test/fixtures/admin";
import { incidentFactory } from "../test/fixtures/incidents";
describe("Incidencias: revisión y conversión trazable del parque", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer(
      {
        users: [rangerActor, masterActor, parkWorker],
        incidents: [
          incidentFactory(),
          incidentFactory({ id: "foreign-report", parkId: "2" }),
        ],
      },
      rangerActor,
    );
  });
  it("recibe solo incidencias del parque enviadas por guías", async () => {
    expect(await incidentService.getIncidents()).toEqual([incidentFactory()]);
    await expect(
      incidentService.getIncidentById("foreign-report"),
    ).rejects.toThrow("no pertenece");
  });
  it("revisa sin perder historial ni modificar información del guía", async () => {
    const result = await incidentService.markReviewed("guide-report-1");
    expect(result).toMatchObject({
      status: "reviewed",
      reviewedByUserId: rangerActor.id,
      description: incidentFactory().description,
    });
    expect(result.history[0]).toMatchObject({
      action: "reviewed",
      actorUserId: rangerActor.id,
    });
    await incidentService.markReviewed("guide-report-1");
    expect(db.incidents[0].history).toHaveLength(1);
  });
  it.each(["tasks", "maintenance"])(
    "convierte a %s con referencia, sin copiar el reporte",
    async (moduleKey) => {
      await incidentService.markReviewed("guide-report-1");
      const relation = await incidentService.convert(
        "guide-report-1",
        moduleKey,
      );
      expect(db[moduleKey]).toHaveLength(1);
      const record = db[moduleKey][0];
      expect(record).toMatchObject({
        parkId: "1",
        sourceIncidentId: "guide-report-1",
        createdByUserId: rangerActor.id,
        assignedToUserId: rangerActor.id,
      });
      expect(record).not.toHaveProperty("description");
      expect(record).not.toHaveProperty("location");
      expect(record.title).not.toBe(incidentFactory().title);
      expect(db.incidents[0]).toMatchObject({
        status: "converted",
        convertedRecord: relation,
        convertedByUserId: rangerActor.id,
      });
      expect(db.incidents[0].history.map((event) => event.action)).toEqual([
        "reviewed",
        "converted",
      ]);
      expect(
        await incidentService.convert("guide-report-1", moduleKey),
      ).toEqual(relation);
      expect(db[moduleKey]).toHaveLength(1);
    },
  );
  it("no duplica registros ante dos conversiones simultáneas", async () => {
    const [first, second] = await Promise.all([
      incidentService.convert("guide-report-1", "tasks"),
      incidentService.convert("guide-report-1", "tasks"),
    ]);
    expect(first).toEqual(second);
    expect(db.tasks).toHaveLength(1);
    expect(db.incidents[0].history).toHaveLength(1);
    await expect(
      incidentService.convert("guide-report-1", "maintenance"),
    ).rejects.toThrow("otro módulo");
    expect(db.maintenance).toHaveLength(0);
  });
  it("recupera POST exitoso y PATCH fallido sin crear otro registro", async () => {
    const implementation = apiClient.getMockImplementation();
    let fail = true;
    apiClient.mockImplementation((path, options) => {
      if (
        path === "/incidents/guide-report-1" &&
        options?.method === "PATCH" &&
        fail
      ) {
        fail = false;
        throw new Error("Fallo temporal");
      }
      return implementation(path, options);
    });
    await expect(
      incidentService.convert("guide-report-1", "tasks"),
    ).rejects.toThrow("Fallo temporal");
    expect(db.tasks).toHaveLength(1);
    await expect(
      incidentService.convert("guide-report-1", "maintenance"),
    ).rejects.toThrow("otro módulo");
    await incidentService.convert("guide-report-1", "tasks");
    expect(db.tasks).toHaveLength(1);
    expect(db.incidents[0].status).toBe("converted");
  });
  it("rechaza modificar o convertir incidencias de otro parque", async () => {
    await expect(
      incidentService.markReviewed("foreign-report"),
    ).rejects.toThrow("no pertenece");
    await expect(
      incidentService.convert("foreign-report", "tasks"),
    ).rejects.toThrow("no pertenece");
    expect(writes()).toHaveLength(0);
  });
  it("rechaza actor inactivo y no da gestión al Maestro por su nombre", async () => {
    db.users[0].active = false;
    await expect(
      incidentService.convert("guide-report-1", "tasks"),
    ).rejects.toThrow("ya no está activa");
    mockJsonServer({ incidents: [incidentFactory()] }, masterActor);
    await expect(incidentService.getIncidents()).rejects.toThrow(
      "No tienes permiso",
    );
    expect(writes()).toHaveLength(0);
  });
});

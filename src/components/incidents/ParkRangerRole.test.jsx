import React, { Suspense } from "react";
import { beforeEach, it, expect, vi } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../../services/taskService");
vi.unmock("../../services/maintenanceService");
vi.unmock("../../services/touristService");
vi.unmock("../../services/heritageService");
vi.unmock("../../services/speciesService");
vi.unmock("../../services/wellService");
import { AppRoutes } from "../../routes/AppRoutes";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import {
  rangerActor,
  masterActor,
  parkWorker,
} from "../../test/fixtures/admin";
import { incidentFactory } from "../../test/fixtures/incidents";
let db;
beforeEach(() => {
  db = mockJsonServer(
    {
      users: [rangerActor, masterActor, parkWorker],
      incidents: [incidentFactory()],
    },
    rangerActor,
  );
});
const mount = (route) =>
  renderWithProviders(
    <Suspense fallback={<p>Cargando</p>}>
      <AppRoutes />
    </Suspense>,
    { route, path: "*", auth: { user: rangerActor } },
  );
it("revisa y convierte el reporte sin copiarlo, y consulta el origen desde la tarea", async () => {
  const { user } = mount("/incidents");
  await user.click(
    await screen.findByRole("button", { name: "Reporte ficticio de guía" }),
  );
  await user.click(screen.getByRole("button", { name: "Marcar revisada" }));
  await waitFor(() => expect(db.incidents[0].status).toBe("reviewed"));
  await user.click(
    await screen.findByRole("button", { name: "Convertir en tarea" }),
  );
  await user.click(
    await screen.findByRole("link", { name: "Abrir registro vinculado" }),
  );
  await screen.findByRole("heading", {
    name: "Atender incidencia #guide-report-1",
  });
  expect(
    await screen.findByText("Descripción original del reporte."),
  ).toBeVisible();
  expect(db.tasks).toHaveLength(1);
  expect(db.tasks[0].description).toBeUndefined();
  expect(
    screen.queryByRole("button", { name: "Delegar registro" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Marcar como finalizada" }),
  ).toBeVisible();
});
it("participa en chat grupal sin acceso administrativo ni usuarios", async () => {
  const { user } = mount("/chat");
  await screen.findByRole("heading", { name: "Chat del parque" });
  expect(
    screen.queryByRole("tab", { name: "Directo administrativo" }),
  ).not.toBeInTheDocument();
  const nav = screen.getByRole("complementary", {
    name: "Navegación principal",
  });
  expect(within(nav).getByRole("link", { name: "Incidencias" })).toBeVisible();
  expect(
    within(nav).queryByRole("link", { name: "Usuarios" }),
  ).not.toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Mensaje", exact: true }),
    "Reporte de campo ficticio",
  );
  await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
  expect(await screen.findByText("Reporte de campo ficticio")).toBeVisible();
});
it("rechaza la ruta de administración de usuarios", async () => {
  mount("/users");
  expect(
    await screen.findByRole("heading", { name: "Acceso restringido" }),
  ).toBeVisible();
});
it("mantiene visible que registrar patrimonio no autoriza la intervención", async () => {
  mount("/heritage/new");
  expect(
    await screen.findByText(
      /Registrar una intervención no significa autorizarla/,
    ),
  ).toBeVisible();
  expect(screen.getByRole("option", { name: "Aprobada" })).toBeDisabled();
});

import React, { Suspense } from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../../services/taskService");
vi.unmock("../../services/maintenanceService");
vi.unmock("../../services/touristService");
vi.unmock("../../services/heritageService");
vi.unmock("../../services/speciesService");
vi.unmock("../../services/wellService");
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { ReportsPage } from "../../pages/reports/ReportsPage";
import { TaskDetailPage } from "../../pages/tasks/TaskDetailPage";
import { writeStorage } from "../../utils/storage";
import { sessionKey } from "../../services/sessionAccess";
import { AppRoutes } from "../../routes/AppRoutes";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import { recordFixture } from "../../test/fixtures/records";
import {
  adminActor,
  masterActor,
  parkWorker,
  foreignWorker,
} from "../../test/fixtures/admin";
describe("ADMIN: Pages reales y navegación compartida", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer(
      {
        users: [masterActor, adminActor, parkWorker, foreignWorker],
        tasks: [recordFixture("tasks", { id: "task-1", parkId: "1" })],
      },
      adminActor,
    );
  });
  const mount = (ui, extra = {}) =>
    renderWithProviders(ui, { auth: { user: adminActor }, ...extra });
  it("ve dashboard sin pozo ni CTA de registrar especie", async () => {
    mount(<DashboardPage />);
    expect(
      await screen.findByRole("heading", { name: "Resumen del Parque" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /monitoreo del pozo/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Registro de fauna y flora" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Asignadas a mí")).not.toBeInTheDocument();
  });
  it("sin permiso no presenta delegación ni finalización de tarea", async () => {
    mount(<TaskDetailPage />, { route: "/tasks/task-1", path: "/tasks/:id" });
    await screen.findByRole("heading", { name: "Registro ficticio" });
    expect(
      screen.queryByRole("button", { name: "Delegar registro" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Marcar como finalizada" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Finalizada" })).toBeDisabled();
  });
  it("con permiso delega a usuario activo del parque desde la Page existente", async () => {
    const actor = { ...adminActor, optionalPermissions: ["task.delegate"] };
    db.users.find((user) => user.id === actor.id).optionalPermissions =
      actor.optionalPermissions;
    const { user } = mount(<TaskDetailPage />, {
      route: "/tasks/task-1",
      path: "/tasks/:id",
      auth: { user: actor },
    });
    await screen.findByRole("heading", { name: "Registro ficticio" });
    const select = await screen.findByLabelText(/Usuario responsable/);
    await waitFor(() =>
      expect(
        within(select).getByRole("option", { name: parkWorker.name }),
      ).toBeVisible(),
    );
    await user.selectOptions(select, parkWorker.id);
    await user.click(screen.getByRole("button", { name: "Delegar registro" }));
    await waitFor(() => expect(db.tasks[0].assignedByUserId).toBe(actor.id));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Delegar registro" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Reasignar responsable" }),
    ).not.toBeInTheDocument();
  });
  it("consulta reportes sin catálogo de pozo ni exportación y habilita exportación al asignarla", async () => {
    const { unmount } = mount(<ReportsPage />);
    await screen.findByRole("heading", {
      name: "Centro de Reportes Consolidados",
    });
    expect(
      screen.queryByRole("link", { name: "Descargar CSV mock" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Reporte hidrológico del pozo" }),
    ).not.toBeInTheDocument();
    unmount();
    mount(<ReportsPage />, {
      auth: {
        user: { ...adminActor, optionalPermissions: ["reports.export"] },
      },
    });
    expect(
      await screen.findByRole("link", { name: "Descargar CSV mock" }),
    ).toBeVisible();
  });
  it("gestiona usuarios con opcionales sin mostrar asignación de roles ni permisos", async () => {
    const actor = {
      ...adminActor,
      optionalPermissions: ["users.view", "users.edit"],
    };
    db.users.find((user) => user.id === actor.id).optionalPermissions =
      actor.optionalPermissions;
    const { user } = mount(<DashboardPage section="users" />, {
      auth: { user: actor },
    });
    await screen.findByRole("heading", { name: "Usuarios del parque" });
    expect(
      screen.queryByRole("button", { name: "Asignar rol" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Guardar permisos" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Crear usuario" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: `Editar usuario ${parkWorker.name}` }),
    );
    const dialog = screen.getByRole("dialog");
    await user.clear(within(dialog).getByLabelText(/Nombre completo/));
    await user.type(
      within(dialog).getByLabelText(/Nombre completo/),
      "Persona Editada por Admin",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar usuario" }),
    );
    expect(
      await screen.findByRole("button", {
        name: "Editar usuario Persona Editada por Admin",
      }),
    ).toBeVisible();
  });
  it("el Maestro concede y retira opcionales desde Usuarios", async () => {
    writeStorage(sessionKey, masterActor);
    const { user } = mount(<DashboardPage section="users" />, {
      auth: { user: masterActor },
    });
    const form = await screen.findByRole("form", {
      name: `Permisos de ${adminActor.name}`,
    });
    await user.click(
      within(form).getByRole("checkbox", { name: "Delegar tareas" }),
    );
    await user.click(
      within(form).getByRole("button", { name: "Guardar permisos" }),
    );
    await waitFor(() =>
      expect(
        db.users.find((item) => item.id === adminActor.id).optionalPermissions,
      ).toEqual(["task.delegate"]),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Guardar permisos" }),
      ).toBeDisabled(),
    );
    await user.click(screen.getByRole("checkbox", { name: "Delegar tareas" }));
    await user.click(screen.getByRole("button", { name: "Guardar permisos" }));
    await waitFor(() =>
      expect(
        db.users.find((item) => item.id === adminActor.id).optionalPermissions,
      ).toEqual([]),
    );
  });
  it.each([
    "/users",
    "/well-monitoring",
    "/species/new",
    "/heritage/1/edit",
    "/tourists/1/edit",
  ])("rechaza URL directa sin permiso: %s", async (route) => {
    mount(
      <Suspense fallback={<p>Cargando rutas</p>}>
        <AppRoutes />
      </Suspense>,
      { route, path: "*" },
    );
    expect(
      await screen.findByRole("heading", { name: "Acceso restringido" }),
    ).toBeVisible();
  });
  it("muestra Chat administrativo y navegación sin Usuarios ni Pozo", async () => {
    mount(
      <Suspense fallback={<p>Cargando rutas</p>}>
        <AppRoutes />
      </Suspense>,
      { route: "/chat", path: "*" },
    );
    expect(
      await screen.findByRole("heading", { name: "Chat del parque" }),
    ).toBeVisible();
    expect(screen.getByRole("tab", { name: "Chat grupal" })).toBeVisible();
    expect(
      screen.getByRole("tab", { name: "Directo administrativo" }),
    ).toBeVisible();
    const nav = screen.getByRole("complementary", {
      name: "Navegación principal",
    });
    expect(within(nav).getByRole("link", { name: "Chat" })).toBeVisible();
    expect(
      within(nav).queryByRole("link", { name: "Usuarios" }),
    ).not.toBeInTheDocument();
    expect(
      within(nav).queryByRole("link", { name: "Pozo de Agua" }),
    ).not.toBeInTheDocument();
  });
});

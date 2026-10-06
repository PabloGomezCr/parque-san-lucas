import React from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../../services/taskService");
vi.unmock("../../services/maintenanceService");
vi.unmock("../../services/touristService");
vi.unmock("../../services/heritageService");
vi.unmock("../../services/speciesService");
vi.unmock("../../services/wellService");
import { TaskDetailPage } from "../../pages/tasks/TaskDetailPage";
import { TaskFormPage } from "../../pages/tasks/TaskFormPage";
import { MaintenanceDetailPage } from "../../pages/maintenance/MaintenanceDetailPage";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { Sidebar } from "../layout/Sidebar";
import { DelegationSummary } from "./DelegationSummary";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import {
  masterActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../../test/fixtures/admin";
import { recordFixture } from "../../test/fixtures/records";
const auth = { user: masterActor };
describe("MASTER_ADMIN: flujos de administración", () => {
  let db;
  beforeEach(() => {
    db = mockJsonServer({
      tasks: [recordFixture("tasks", { id: "task-1", parkId: "1" })],
      maintenance: [
        recordFixture("maintenance", { id: "maintenance-1", parkId: "1" }),
      ],
    });
  });
  it.each([
    ["tasks", "task-1", TaskDetailPage],
    ["maintenance", "maintenance-1", MaintenanceDetailPage],
  ])(
    "delega y reasigna desde detalle de %s con historial visible",
    async (moduleKey, id, Page) => {
      const { user } = renderWithProviders(<Page />, {
        route: `/${moduleKey}/${id}`,
        path: `/${moduleKey}/:id`,
        auth,
      });
      await screen.findByRole("heading", { name: "Registro ficticio" });
      const select = await screen.findByRole("combobox", {
        name: /Usuario responsable/,
      });
      await waitFor(() =>
        expect(
          within(select).getByRole("option", { name: parkWorker.name }),
        ).toBeVisible(),
      );
      expect(
        within(select).queryByRole("option", { name: foreignWorker.name }),
      ).not.toBeInTheDocument();
      expect(
        within(select).queryByRole("option", { name: inactiveWorker.name }),
      ).not.toBeInTheDocument();
      await user.selectOptions(select, parkWorker.id);
      await user.click(
        screen.getByRole("button", { name: "Delegar registro" }),
      );
      await screen.findByRole("button", { name: "Reasignar responsable" });
      expect(
        screen.getByRole("table", { name: "Historial de delegación" }),
      ).toHaveTextContent(masterActor.name);
      await user.selectOptions(
        screen.getByRole("combobox", { name: /Usuario responsable/ }),
        masterActor.id,
      );
      await user.click(
        screen.getByRole("button", { name: "Reasignar responsable" }),
      );
      await waitFor(() =>
        expect(
          within(
            screen.getByRole("table", { name: "Historial de delegación" }),
          ).getAllByRole("row"),
        ).toHaveLength(3),
      );
      expect(db[moduleKey][0].delegationHistory).toHaveLength(2);
      expect(
        screen.queryByRole("button", { name: "Eliminar registro" }),
      ).not.toBeInTheDocument();
    },
  );
  it("crea tarea usando responsable activo y registra la delegación inicial", async () => {
    const { user } = renderWithProviders(<TaskFormPage />, {
      route: "/tasks/new",
      auth,
    });
    await screen.findByRole("heading", { name: "Registrar nueva tarea" });
    const select = screen.getByLabelText(/Responsable asignado/);
    await waitFor(() =>
      expect(
        within(select).getByRole("option", { name: parkWorker.name }),
      ).toBeVisible(),
    );
    await user.type(
      screen.getByLabelText(/Título de la labor/),
      "Nueva tarea ficticia",
    );
    await user.type(screen.getByLabelText(/Fecha programada/), "2026-10-05");
    await user.type(
      screen.getByLabelText(/Descripción detallada/),
      "Descripción de prueba",
    );
    await user.selectOptions(select, parkWorker.id);
    await user.click(screen.getByRole("button", { name: "Guardar tarea" }));
    expect(await screen.findByText(/Destino: \/tasks\//)).toBeVisible();
    expect(db.tasks.at(-1)).toMatchObject({
      assignedToUserId: parkWorker.id,
      assignedByUserId: masterActor.id,
      parkId: "1",
    });
    expect(db.tasks.at(-1).delegationHistory).toHaveLength(1);
  });
  it("gestiona usuarios y asigna un rol desde la ruta existente del dashboard", async () => {
    const { user } = renderWithProviders(<DashboardPage section="users" />, {
      route: "/users",
      auth,
    });
    await screen.findByRole("heading", { name: "Usuarios del parque" });
    expect(screen.queryByText(foreignWorker.name)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));
    let dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/Nombre completo/),
      "Nueva Persona",
    );
    await user.type(
      within(dialog).getByLabelText(/Correo/),
      "nueva@example.test",
    );
    await user.type(
      within(dialog).getByLabelText(/Contraseña de demostración/),
      "clave-ficticia",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar usuario" }),
    );
    await screen.findByRole("button", { name: "Editar usuario Nueva Persona" });
    await user.click(
      screen.getByRole("button", { name: "Editar usuario Nueva Persona" }),
    );
    dialog = screen.getByRole("dialog");
    await user.clear(within(dialog).getByLabelText(/Nombre completo/));
    await user.type(
      within(dialog).getByLabelText(/Nombre completo/),
      "Persona Editada",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar usuario" }),
    );
    await screen.findByRole("button", {
      name: "Editar usuario Persona Editada",
    });
    await user.selectOptions(
      screen.getByLabelText("Rol de Persona Editada"),
      "MASTER_ADMIN",
    );
    const row = screen.getByRole("row", { name: /Persona Editada/ });
    await user.click(within(row).getByRole("button", { name: "Asignar rol" }));
    await waitFor(() =>
      expect(
        db.users.find((item) => item.email === "nueva@example.test").role,
      ).toBe("MASTER_ADMIN"),
    );
    expect(
      db.users.find((item) => item.email === "nueva@example.test").parkId,
    ).toBe("1");
  });
  it("envía chat grupal y directo administrativo sin mezclar conversaciones", async () => {
    const { user } = renderWithProviders(<DashboardPage section="chat" />, {
      route: "/chat",
      auth,
    });
    await screen.findByText("No hay mensajes todavía.");
    await user.type(
      screen.getByRole("textbox", { name: "Mensaje" }),
      "Mensaje grupal ficticio",
    );
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await screen.findByText("Mensaje grupal ficticio", { exact: false });
    await user.click(
      screen.getByRole("tab", { name: "Directo administrativo" }),
    );
    const recipients = await screen.findByLabelText("Destinatario");
    expect(
      within(recipients).queryByRole("option", { name: foreignWorker.name }),
    ).not.toBeInTheDocument();
    await user.selectOptions(recipients, parkWorker.id);
    await screen.findByText("No hay mensajes todavía.");
    expect(
      screen.queryByText("Mensaje grupal ficticio", { exact: false }),
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "Mensaje" }),
      "Mensaje directo ficticio",
    );
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(
      await screen.findByText("Mensaje directo ficticio", { exact: false }),
    ).toBeVisible();
    expect(db.chatMessages).toHaveLength(2);
  });
  it("muestra navegación compartida con Usuarios, Chat y perfil", () => {
    renderWithProviders(<Sidebar onLogout={() => {}} />, { auth });
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute(
      "href",
      "/users",
    );
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute(
      "href",
      "/chat",
    );
    expect(screen.getByRole("link", { name: "Mi perfil" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });
  it("integra bloques de delegación en DashboardPage sin crear otra Page", async () => {
    renderWithProviders(<DashboardPage />, { auth });
    await screen.findByRole("heading", { name: "Resumen del Parque" });
    expect(await screen.findByText("Asignadas a mí")).toBeVisible();
    expect(screen.getByText("Delegadas por mí")).toBeVisible();
  });
  it("muestra el resumen de asignaciones y quién delegó con navegación al detalle", async () => {
    db.tasks[0] = {
      ...db.tasks[0],
      assignedToUserId: masterActor.id,
      assignedByUserId: masterActor.id,
      delegationHistory: [
        {
          id: "event-1",
          moduleKey: "tasks",
          recordId: "task-1",
          assignedByName: masterActor.name,
          assignedToName: masterActor.name,
          delegatedAt: "2026-10-05T12:00:00Z",
        },
      ],
    };
    const { user } = renderWithProviders(<DelegationSummary />, { auth });
    await screen.findByRole("table", {
      name: "Resumen de delegaciones del parque",
    });
    expect(screen.getByText("Asignadas a mí")).toBeVisible();
    expect(screen.getByText("Delegadas por mí")).toBeVisible();
    await user.click(
      screen.getAllByRole("link", { name: "Registro ficticio" })[0],
    );
    expect(await screen.findByText("Destino: /tasks/task-1")).toBeVisible();
  });
});

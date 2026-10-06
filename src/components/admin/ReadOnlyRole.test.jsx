import React, { Suspense } from "react";
import { beforeEach, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../../services/taskService");
vi.unmock("../../services/maintenanceService");
vi.unmock("../../services/heritageService");
vi.unmock("../../services/speciesService");
vi.unmock("../../services/wellService");
import { AppRoutes } from "../../routes/AppRoutes";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import {
  masterActor,
  parkWorker,
  readOnlyActor,
} from "../../test/fixtures/admin";
import { recordFixture } from "../../test/fixtures/records";

let db;
beforeEach(() => {
  db = mockJsonServer(
    {
      users: [readOnlyActor, masterActor, parkWorker],
      tasks: [recordFixture("tasks", { id: "task-read", parkId: "1" })],
      maintenance: [
        recordFixture("maintenance", { id: "maintenance-read", parkId: "1" }),
      ],
      heritageInterventions: [
        recordFixture("heritage", { id: "heritage-read", parkId: "1" }),
      ],
      species: [
        recordFixture("species", { id: "species-read", parkId: "1" }),
      ],
    },
    readOnlyActor,
  );
});

const mount = (route, actor = readOnlyActor) =>
  renderWithProviders(
    <Suspense fallback={<p>Cargando</p>}>
      <AppRoutes />
    </Suspense>,
    { route, path: "*", auth: { user: actor } },
  );

it("consulta dashboard y oculta accesos de creación y módulos no autorizados", async () => {
  mount("/dashboard");
  expect(
    await screen.findByRole("heading", { name: "Resumen del Parque" }),
  ).toBeVisible();
  expect(screen.getByText("Tareas pendientes")).toBeVisible();
  expect(screen.getByText("Especies registradas")).toBeVisible();
  expect(screen.queryByText("Turistas atendidos")).not.toBeInTheDocument();
  for (const name of [
    "Nueva tarea",
    "Registrar primera tarea",
    "Registrar atención de turistas",
    "Registro de fauna y flora",
  ])
    expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
  const navigation = within(
    screen.getByRole("complementary", { name: "Navegación principal" }),
  );
  for (const label of ["Inicio", "Tareas", "Mantenimiento", "Patrimonio", "Especies", "Reportes"])
    expect(navigation.getByRole("link", { name: label })).toBeVisible();
  expect(navigation.getByRole("link", { name: "Mi perfil" })).toBeVisible();
  expect(navigation.queryByRole("link", { name: "Chat" })).not.toBeInTheDocument();
  expect(navigation.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
});

it.each([
  ["/tasks", "Registro ficticio"],
  ["/maintenance", "Registro ficticio"],
  ["/heritage", "Registro ficticio"],
  ["/species", "Registro ficticio"],
])("consulta %s sin acciones de creación", async (path, recordTitle) => {
  mount(path);
  expect((await screen.findAllByText(recordTitle))[0]).toBeVisible();
  expect(screen.queryByRole("link", { name: /Registrar|Crear|Nueva/ })).not.toBeInTheDocument();
});

it("consulta el detalle de una tarea sin editar, borrar, completar o delegar", async () => {
  mount("/tasks/task-read");
  expect(await screen.findByRole("heading", { name: "Registro ficticio" })).toBeVisible();
  for (const name of ["Editar", "Agregar evidencia", "Eliminar registro", "Marcar como finalizada", "Delegar registro"])
    expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Cambiar estado")).not.toBeInTheDocument();
});

it("consulta reportes sin exportar y perfil sin formularios de edición", async () => {
  const { unmount } = mount("/reports");
  expect(
    await screen.findByRole("heading", { name: "Centro de Reportes Consolidados" }),
  ).toBeVisible();
  expect(screen.queryByRole("link", { name: "Descargar CSV mock" })).not.toBeInTheDocument();
  unmount();
  mount("/profile");
  expect(await screen.findByRole("heading", { name: "Perfil de usuario" })).toBeVisible();
  expect(
    screen.getByRole("heading", { name: readOnlyActor.name, level: 2 }),
  ).toBeVisible();
  expect(screen.queryByRole("tab", { name: "Seguridad y sesión" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Nombre completo")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Guardar perfil" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Actualizar contraseña mock" })).not.toBeInTheDocument();
});

it.each([
  "/tasks/new",
  "/tasks/task-read/edit",
  "/maintenance/new",
  "/maintenance/maintenance-read/edit",
  "/heritage/new",
  "/species/new",
  "/users",
  "/chat",
])("bloquea la ruta sin permiso %s", async (path) => {
  mount(path);
  expect(
    await screen.findByRole("heading", { name: "Acceso restringido" }),
  ).toBeVisible();
});

it("permite chat grupal solo después de la concesión opcional", async () => {
  const actor = { ...readOnlyActor, optionalPermissions: ["chat.group"] };
  db.users.find((user) => String(user.id) === String(actor.id)).optionalPermissions =
    actor.optionalPermissions;
  mount("/chat", actor);
  expect(await screen.findByRole("tab", { name: "Chat grupal" })).toBeVisible();
  expect(screen.queryByRole("tab", { name: "Directo administrativo" })).not.toBeInTheDocument();
});
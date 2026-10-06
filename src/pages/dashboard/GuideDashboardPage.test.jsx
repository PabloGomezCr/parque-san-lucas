import React, { Suspense } from "react";
import { beforeEach, it, expect, vi } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
vi.unmock("../../services/speciesService");
vi.unmock("../../services/heritageService");
import { AppRoutes } from "../../routes/AppRoutes";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import {
  guideActor,
  rangerActor,
  masterActor,
} from "../../test/fixtures/admin";
import { incidentFactory } from "../../test/fixtures/incidents";

const route = {
  id: "route-1",
  parkId: "1",
  name: "Sendero histórico",
  difficulty: "Moderada",
  duration: "90 min",
  description: "Recorrido interpretativo.",
  active: true,
};
const group = {
  id: "group-1",
  parkId: "1",
  guideId: guideActor.id,
  quantity: 8,
  origin: "San José",
  language: "Español",
  groupType: "Educativo",
  date: "2026-10-05",
  time: "09:00",
  observations: "Sin requerimientos adicionales.",
};
let db;

beforeEach(() => {
  db = mockJsonServer(
    {
      users: [guideActor, rangerActor, masterActor],
      parks: [
        {
          id: "1",
          name: "Parque Nacional Isla San Lucas",
          type: "Insular",
          country: "Costa Rica",
          status: "operativo",
        },
      ],
      parkRoutes: [route, { ...route, id: "foreign-route", parkId: "2" }],
      tours: [
        {
          id: "tour-1",
          parkId: "1",
          guideId: guideActor.id,
          date: "2026-10-05",
          startTime: "09:00",
          endTime: "11:00",
          routeId: route.id,
          groupId: group.id,
          status: "scheduled",
          notes: "",
        },
        {
          id: "tour-other",
          parkId: "1",
          guideId: rangerActor.id,
          date: "2026-10-05",
          startTime: "10:00",
          endTime: "11:00",
          routeId: route.id,
          status: "scheduled",
        },
      ],
      visitorGroups: [group],
      incidents: [
        incidentFactory({
          reportedByUserId: guideActor.id,
          reportedByName: guideActor.name,
        }),
        incidentFactory({
          id: "other-report",
          reportedByUserId: rangerActor.id,
        }),
      ],
      species: [
        {
          id: "species-1",
          parkId: "1",
          commonName: "Lapa roja",
          scientificName: "Ara macao",
          category: "Aves",
          status: "observed",
          lastSeen: "2026-10-05",
        },
      ],
      heritageInterventions: [
        {
          id: "heritage-1",
          parkId: "1",
          site: "Celda histórica",
          interventionType: "Conservación",
          status: "pending",
          date: "2026-10-05",
          responsible: "Equipo del parque",
        },
      ],
    },
    guideActor,
  );
});

const mount = (routePath) =>
  renderWithProviders(
    <Suspense fallback={<p>Cargando</p>}>
      <AppRoutes />
    </Suspense>,
    { route: routePath, path: "*", auth: { user: guideActor } },
  );

it("muestra dashboard de guía y navegación propia sin módulos operativos", async () => {
  mount("/dashboard");
  expect(
    await screen.findByRole("heading", { name: "Inicio del guía" }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Recorridos de hoy" }),
  ).toBeVisible();
  expect(screen.getByText("Visitantes atendidos")).toBeVisible();
  const navigation = within(
    screen.getByRole("complementary", { name: "Navegación principal" }),
  );
  for (const label of [
    "Inicio",
    "Mis recorridos",
    "Visitantes",
    "Información del parque",
    "Incidencias",
    "Chat",
  ])
    expect(navigation.getByRole("link", { name: label })).toBeVisible();
  expect(navigation.getByRole("link", { name: "Mi perfil" })).toBeVisible();
  for (const label of [
    "Tareas",
    "Mantenimiento",
    "Pozo de Agua",
    "Reportes",
    "Usuarios",
    "Turistas",
  ])
    expect(
      navigation.queryByRole("link", { name: label }),
    ).not.toBeInTheDocument();
});

it("crea y solo lista recorridos propios con rutas del parque", async () => {
  const { user } = mount("/tours");
  expect((await screen.findAllByText("Sendero histórico"))[0]).toBeVisible();
  expect(screen.queryByText("tour-other")).not.toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Recorrido" }),
    "route-1",
  );
  expect(
    screen.queryByRole("option", { name: /foreign-route/ }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Guardar recorrido" }));
  expect(
    await screen.findByRole("heading", { name: "Mis recorridos", level: 1 }),
  ).toBeVisible();
  expect(db.tours).toHaveLength(3);
  expect(db.tours[2]).toMatchObject({
    parkId: "1",
    guideId: guideActor.id,
    routeId: "route-1",
    status: "scheduled",
  });
  await user.selectOptions(
    screen.getByRole("combobox", {
      name: "Estado de Sendero histórico 2026-10-05",
    }),
    "in_progress",
  );
  expect(db.tours[0].status).toBe("in_progress");
});

it("registra grupos con campos mínimos y sin identidad personal", async () => {
  const { user } = mount("/visitors");
  await screen.findByRole("heading", { name: "Registrar grupo" });
  await user.clear(
    screen.getByRole("spinbutton", { name: "Cantidad de visitantes" }),
  );
  await user.type(
    screen.getByRole("spinbutton", { name: "Cantidad de visitantes" }),
    "12",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Procedencia" }),
    "Costa Rica",
  );
  await user.click(screen.getByRole("button", { name: "Registrar grupo" }));
  expect(await screen.findByText("Grupos registrados")).toBeVisible();
  expect(db.visitorGroups).toHaveLength(2);
  expect(db.visitorGroups[1]).toMatchObject({
    quantity: 12,
    parkId: "1",
    guideId: guideActor.id,
    origin: "Costa Rica",
  });
  expect(db.visitorGroups[1]).not.toHaveProperty("visitorName");
});

it("mantiene las rutas antiguas de turistas en la vista agregada del guía", async () => {
  mount("/tourists");
  expect(await screen.findByRole("heading", { name: "Visitantes" })).toBeVisible();
  expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Registrar atención de turistas" })).not.toBeInTheDocument();
});

it("envía incidencias trazables para revisión sin capacidad de gestión", async () => {
  const { user } = mount("/incidents");
  await screen.findByRole("heading", { name: "Nuevo reporte" });
  await user.type(
    screen.getByRole("textbox", { name: "Título" }),
    "Señalización dañada",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Descripción" }),
    "Se requiere revisar una señal en el sendero.",
  );
  await user.click(screen.getByRole("button", { name: "Enviar reporte" }));
  expect(await screen.findByText("Mis reportes")).toBeVisible();
  expect(db.incidents).toHaveLength(3);
  expect(db.incidents[2]).toMatchObject({
    parkId: "1",
    reportedByUserId: guideActor.id,
    status: "received",
    title: "Señalización dañada",
  });
  expect(db.incidents[2].history[0].action).toBe("reported");
  expect(
    screen.queryByRole("button", { name: "Convertir en tarea" }),
  ).not.toBeInTheDocument();
});

it("consulta especies y patrimonio en modo lectura", async () => {
  const { unmount, user } = mount("/species");
  expect(await screen.findByText("Lapa roja")).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Registrar nueva especie" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Ficha técnica" }));
  expect(await screen.findByRole("heading", { name: "Lapa roja" })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /observaci/i })).not.toBeInTheDocument();
  unmount();
  const heritage = mount("/heritage");
  expect(await screen.findByText("Celda histórica")).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Registrar intervención patrimonial" }),
  ).not.toBeInTheDocument();
  await heritage.user.click(screen.getByRole("link", { name: "Ver intervención" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Celda histórica" })).toBeVisible());
  expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
});

it.each(["/users", "/maintenance"])(
  "deniega el módulo administrativo %s",
  async (path) => {
    mount(path);
    expect(
      await screen.findByRole("heading", { name: "Acceso restringido" }),
    ).toBeVisible();
  },
);

it("usa el chat grupal del parque y no muestra el canal administrativo", async () => {
  const { user } = mount("/chat");
  await screen.findByRole("heading", { name: "Chat del parque" });
  expect(
    screen.queryByRole("tab", { name: "Directo administrativo" }),
  ).not.toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Mensaje" }),
    "Coordinación de recorrido",
  );
  await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
  expect(await screen.findByText("Coordinación de recorrido")).toBeVisible();
  expect(db.chatMessages[0]).toMatchObject({
    kind: "group",
    parkId: "1",
    senderUserId: guideActor.id,
  });
});

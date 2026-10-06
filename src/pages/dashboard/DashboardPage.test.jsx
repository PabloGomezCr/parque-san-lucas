import React from "react";
import { beforeEach, describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { DashboardPage } from "./DashboardPage";
import { modules } from "../../config/modules";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockCollections } from "../../test/mocks/collections";
import { taskFactory } from "../../test/fixtures/tasks";
import { wellReadingFactory } from "../../test/fixtures/wellReadings";
describe("DashboardPage", () => {
  beforeEach(() => mockCollections());
  it("muestra carga y colecciones vacías sin fallar", async () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(
      await screen.findByRole("heading", { name: "Resumen del Parque" }),
    ).toBeVisible();
    expect(screen.getByText("No hay actividades registradas")).toBeVisible();
    expect(screen.getByText("Sin lecturas disponibles.")).toBeVisible();
  });
  it("muestra error de un módulo y reintenta", async () => {
    modules.tasks.getAll.mockRejectedValueOnce(
      new Error("Datos no disponibles"),
    );
    const { user } = renderWithProviders(<DashboardPage />);
    expect(await screen.findByText("Datos no disponibles")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByRole("heading", { name: "Resumen del Parque" }),
    ).toBeVisible();
  });
  it("calcula métricas desde módulos y navega mediante acceso rápido", async () => {
    modules.tasks.getAll.mockResolvedValue([
      taskFactory(),
      taskFactory({ id: "mock-2", status: "completed" }),
    ]);
    const { wellService } = await import("../../services/wellService");
    wellService.getReadings.mockResolvedValue([wellReadingFactory()]);
    const { user } = renderWithProviders(<DashboardPage />);
    await screen.findByRole("heading", { name: "Resumen del Parque" });
    expect(
      screen.getByRole("img", {
        name: /Tareas: Pendientes 1, En curso 0, Finalizadas 1/,
      }),
    ).toBeVisible();
    expect(screen.getAllByText("12 m").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("link", { name: "Nueva tarea" }));
    expect(await screen.findByText("Destino: /tasks/new")).toBeVisible();
  });
});

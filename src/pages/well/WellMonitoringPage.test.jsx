import React from "react";
import { beforeEach, describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { WellMonitoringPage } from "./WellMonitoringPage";
import { wellService } from "../../services/wellService";
import { wellReadingFactory } from "../../test/fixtures/wellReadings";
import { renderWithProviders } from "../../test/renderWithProviders";
describe("WellMonitoringPage", () => {
  beforeEach(() => wellService.getReadings.mockResolvedValue([]));
  it("muestra carga y estado sin lecturas", async () => {
    renderWithProviders(<WellMonitoringPage />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(
      await screen.findByText("No hay lecturas registradas"),
    ).toBeVisible();
  });
  it("maneja error y reintenta", async () => {
    wellService.getReadings.mockRejectedValueOnce(
      new Error("Lecturas no disponibles"),
    );
    const { user } = renderWithProviders(<WellMonitoringPage />);
    expect(await screen.findByText("Lecturas no disponibles")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByText("No hay lecturas registradas"),
    ).toBeVisible();
  });
  it("muestra última lectura, tendencia, detalle e histórico filtrado", async () => {
    wellService.getReadings.mockResolvedValue([
      wellReadingFactory({ id: "anterior", date: "2026-01-14", level: 10 }),
      wellReadingFactory(),
    ]);
    const { user } = renderWithProviders(<WellMonitoringPage />);
    await screen.findByRole("heading", { name: "Monitoreo del Pozo de Agua" });
    expect(screen.getAllByText("12 m").length).toBeGreaterThan(0);
    expect(screen.getByText("Variación entre lecturas: +2 m")).toBeVisible();
    expect(screen.getByText(/los sensores, umbrales/)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Ver lectura seleccionada" }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Lectura ficticia");
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("tab", { name: "Histórico de lecturas" }),
    );
    await user.type(screen.getByLabelText("Filtrar por fecha"), "2027-01-01");
    expect(
      screen.getByRole("heading", { name: "No se encontraron resultados" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpiar filtro" }));
    expect(screen.getByRole("table")).toBeVisible();
  });
  it("abre y cierra registro manual desde estado vacío", async () => {
    const { user } = renderWithProviders(<WellMonitoringPage />);
    await screen.findByText("No hay lecturas registradas");
    await user.click(
      screen.getByRole("button", { name: "Registrar primera lectura" }),
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("WellMonitoringPage: mediciones manuales", () => {
  it("guarda lectura manual, cierra modal y actualiza datos", async () => {
    wellService.getReadings.mockResolvedValue([]);
    wellService.createReading.mockResolvedValue(wellReadingFactory());
    const { user } = renderWithProviders(<WellMonitoringPage />);
    await screen.findByText("No hay lecturas registradas");
    await user.click(
      screen.getByRole("button", { name: "Registrar primera lectura" }),
    );
    await user.type(
      screen.getByLabelText(/Fecha de lectura/),
      "2026-01-15T12:00",
    );
    for (const [label, value] of [
      ["Nivel (m)", "12"],
      ["Caudal (L/min)", "25"],
      ["Temperatura (°C)", "24"],
      ["pH", "7"],
    ]) {
      await user.type(screen.getByLabelText(label, { exact: false }), value);
    }
    wellService.getReadings.mockResolvedValue([wellReadingFactory()]);
    await user.click(
      screen.getByRole("button", { name: "Guardar lectura mock" }),
    );
    expect(
      await screen.findByRole("img", { name: /Histórico de nivel/ }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(wellService.createReading).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 12,
        flow: 25,
        mock: true,
        source: "manual-mock",
      }),
    );
  });
});

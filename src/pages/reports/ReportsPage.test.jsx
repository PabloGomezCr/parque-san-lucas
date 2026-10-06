import React from "react";
import { beforeEach, describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { ReportsPage } from "./ReportsPage";
import { modules } from "../../config/modules";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockCollections } from "../../test/mocks/collections";
import { taskFactory } from "../../test/fixtures/tasks";
describe("ReportsPage", () => {
  beforeEach(() => mockCollections());
  it("muestra carga y ausencia de datos, deshabilitando vista previa", async () => {
    renderWithProviders(<ReportsPage />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(
      await screen.findByText(
        "No se encontraron datos para los filtros seleccionados",
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Vista previa" })).toBeDisabled();
  });
  it("maneja rechazo de un servicio", async () => {
    modules.tasks.getAll.mockRejectedValue(new Error("Error de reportes"));
    renderWithProviders(<ReportsPage />);
    expect(await screen.findByText("Error de reportes")).toBeVisible();
  });
  it("deriva registros, filtra por tipo, limpia filtros y exporta CSV mock", async () => {
    modules.tasks.getAll.mockResolvedValue([taskFactory()]);
    const { user } = renderWithProviders(<ReportsPage />);
    await screen.findByRole("heading", {
      name: "Centro de Reportes Consolidados",
    });
    expect(screen.getByText("Registro ficticio")).toBeVisible();
    const csv = screen.getByRole("link", { name: "Descargar CSV mock" });
    expect(csv).toHaveAttribute("download", "reporte-san-lucas-mock.csv");
    expect(csv.getAttribute("href")).toContain("Registro");
    await user.click(screen.getByRole("button", { name: "Vista previa" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("1 registros");
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
    await user.selectOptions(
      screen.getByLabelText("Tipo de reporte"),
      "species",
    );
    expect(
      screen.getByText(
        "No se encontraron datos para los filtros seleccionados",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Registro ficticio")).toBeVisible();
    await user.type(screen.getByLabelText("Desde"), "2027-01-01");
    expect(
      screen.getByText(
        "No se encontraron datos para los filtros seleccionados",
      ),
    ).toBeVisible();
    await user.type(screen.getByLabelText("Hasta"), "2026-01-01");
    expect(
      screen.getByText(
        "La fecha final debe ser posterior o igual a la inicial.",
      ),
    ).toBeVisible();
  });
});

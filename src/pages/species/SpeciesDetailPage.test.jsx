import { SpeciesDetailPage } from "./SpeciesDetailPage";
import { recordPageSuite } from "../../test/recordPageSuites";
recordPageSuite(SpeciesDetailPage, "species", "detail");

import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { speciesService } from "../../services/speciesService";
import { speciesFactory } from "../../test/fixtures/species";
import { renderWithProviders } from "../../test/renderWithProviders";
describe("SpeciesDetailPage: avistamientos", () => {
  it("registra observación y actualiza bitácora", async () => {
    speciesService.getSpeciesById.mockResolvedValue(speciesFactory());
    speciesService.getObservations.mockResolvedValue([]);
    speciesService.createObservation.mockResolvedValue({ id: "obs-mock" });
    const { user } = renderWithProviders(<SpeciesDetailPage />, {
      route: "/species/mock-1",
      path: "/species/:id",
    });
    await screen.findByText("Sin avistamientos registrados");
    await user.click(
      screen.getByRole("button", {
        name: "Registrar avistamiento u observación",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Registrar avistamiento u observación",
      }),
    );
    await user.type(
      screen.getByLabelText(/Fecha del avistamiento/),
      "2026-01-15",
    );
    await user.type(
      screen.getByLabelText(/Observaciones/),
      "Avistamiento ficticio",
    );
    speciesService.getObservations.mockResolvedValue([
      {
        id: "obs-mock",
        speciesId: "mock-1",
        date: "2026-01-15",
        observer: "Persona Ficticia",
        comment: "Avistamiento ficticio",
      },
    ]);
    await user.click(
      screen.getByRole("button", { name: "Guardar observación" }),
    );
    expect(await screen.findByText("Avistamiento ficticio")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(speciesService.createObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        speciesId: "mock-1",
        comment: "Avistamiento ficticio",
        mock: true,
      }),
    );
  });
});

import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { NotFoundPage } from "./NotFoundPage";
import { renderWithProviders } from "../../test/renderWithProviders";
describe("NotFoundPage", () => {
  it("muestra mensaje accesible y permite volver al inicio", async () => {
    const { user } = renderWithProviders(<NotFoundPage />, {
      route: "/ruta-inexistente",
      path: "/ruta-inexistente",
    });
    expect(
      screen.getByRole("heading", { name: "404 · Página no encontrada" }),
    ).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
    expect(await screen.findByText("Destino: /dashboard")).toBeVisible();
  });
});

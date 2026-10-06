import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { UnauthorizedPage } from "./UnauthorizedPage";
import { renderWithProviders } from "../../test/renderWithProviders";
describe("UnauthorizedPage", () => {
  it("muestra mensaje accesible y permite volver al inicio", async () => {
    const { user } = renderWithProviders(<UnauthorizedPage />, {
      route: "/ruta-inexistente",
      path: "/ruta-inexistente",
    });
    expect(
      screen.getByRole("heading", { name: "Acceso restringido" }),
    ).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
    expect(await screen.findByText("Destino: /dashboard")).toBeVisible();
  });
});

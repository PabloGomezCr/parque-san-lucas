import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { ProfilePage } from "./ProfilePage";
import { renderWithProviders, testUser } from "../../test/renderWithProviders";
describe("ProfilePage", () => {
  it("muestra sesión ficticia y persiste tema y preferencias", async () => {
    const { user } = renderWithProviders(<ProfilePage />);
    expect(screen.getByRole("heading", { name: testUser.name })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Preferencias" }));
    await user.click(screen.getByRole("button", { name: "Tema oscuro" }));
    expect(screen.getByRole("button", { name: "Tema oscuro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      JSON.parse(localStorage.getItem("parque-isla-san-lucas-theme")),
    ).toBe("dark");
    await user.selectOptions(
      screen.getByLabelText("Sistema de coordenadas preferido"),
      "CRTM05",
    );
    expect(JSON.parse(localStorage.getItem("sanlucas-coordinate-system"))).toBe(
      "CRTM05",
    );
  });
  it("permite cancelar logout y luego confirma y navega a login", async () => {
    const logout = vi.fn();
    const { user } = renderWithProviders(<ProfilePage />, { auth: { logout } });
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Cancelar",
      }),
    );
    expect(logout).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Cerrar sesión",
      }),
    );
    expect(logout).toHaveBeenCalledOnce();
    expect(await screen.findByText("Destino: /login")).toBeVisible();
  });
  it("valida confirmación de contraseña en el flujo mock", async () => {
    const { user } = renderWithProviders(<ProfilePage />);
    await user.click(screen.getByRole("tab", { name: "Seguridad y sesión" }));
    await user.type(
      screen.getByLabelText(/Contraseña actual/),
      "actual-ficticia",
    );
    await user.type(
      screen.getByLabelText(/Nueva contraseña/),
      "clave-ficticia",
    );
    await user.type(
      screen.getByLabelText(/Confirmar nueva contraseña/),
      "otra-ficticia",
    );
    await user.click(
      screen.getByRole("button", { name: "Actualizar contraseña mock" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("no coinciden");
  });
});

import { authService } from "../../services/authService";
describe("ProfilePage: edición del perfil", () => {
  it("guarda cambios y actualiza la sesión", async () => {
    const updateUser = vi.fn();
    const updated = { ...testUser, name: "Nombre Ficticio" };
    authService.updateProfile.mockResolvedValue(updated);
    const { user } = renderWithProviders(<ProfilePage />, {
      auth: { updateUser },
    });
    await user.clear(screen.getByLabelText(/Nombre completo/));
    await user.type(screen.getByLabelText(/Nombre completo/), updated.name);
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    expect(
      await screen.findByText("Perfil actualizado correctamente."),
    ).toBeVisible();
    expect(updateUser).toHaveBeenCalledWith(updated);
  });
  it("muestra error sin abandonar edición", async () => {
    authService.updateProfile.mockRejectedValue(
      new Error("Perfil no guardado"),
    );
    const { user } = renderWithProviders(<ProfilePage />);
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Perfil no guardado",
    );
  });
});

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { LoginPage } from "./LoginPage";
import { renderWithProviders, testUser } from "../../test/renderWithProviders";
import { deferred } from "../../test/mocks/deferred";
// The logo has a timed visual lifecycle; verify only its authentication signal.
vi.mock("../../components/branding/BrandLogo", () => ({
  BrandLogo: ({ loading }) => (
    <span role="img" aria-label="Marca del parque" aria-busy={loading} />
  ),
}));
describe("LoginPage", () => {
  const mount = (auth) =>
    renderWithProviders(<LoginPage />, {
      route: "/login",
      auth: { isAuthenticated: false, ...auth },
    });
  async function credentials(user) {
    await user.type(
      screen.getByLabelText("Correo o usuario"),
      "persona@example.test",
    );
    await user.type(screen.getByLabelText("Contraseña"), "clave-ficticia");
  }
  it("muestra credenciales y alterna visibilidad de contraseña", async () => {
    const { user } = mount();
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeEnabled();
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "type",
      "password",
    );
    await user.click(
      screen.getByRole("button", { name: "Mostrar contraseña" }),
    );
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
    await user.click(
      screen.getByRole("button", { name: "Ocultar contraseña" }),
    );
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "type",
      "password",
    );
  });
  it("envía credenciales, bloquea formulario y muestra error", async () => {
    const pending = deferred();
    const login = vi.fn(() => pending.promise);
    const { user } = mount({ login });
    await credentials(user);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(login).toHaveBeenCalledWith({
      email: "persona@example.test",
      password: "clave-ficticia",
    });
    expect(
      screen.getByRole("button", { name: "Ingresando al sistema..." }),
    ).toBeDisabled();
    expect(
      screen.getByRole("img", { name: "Marca del parque" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Contraseña")).toBeDisabled();
    pending.reject(new Error("Credenciales inválidas"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    );
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeEnabled();
  });
  it("autentica con el provider real y navega al dashboard", async () => {
    authService.login.mockResolvedValue({
      ...testUser,
      id: "mock-user",
      name: "Persona Ficticia",
    });
    const { user } = renderWithProviders(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
      { route: "/login" },
    );
    await credentials(user);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByText("Destino: /dashboard")).toBeVisible();
  });
  it("redirige una sesión existente", async () => {
    mount({ isAuthenticated: true });
    expect(await screen.findByText("Destino: /dashboard")).toBeVisible();
  });
  it("no envía campos vacíos", async () => {
    const login = vi.fn();
    const { user } = mount({ login });
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(login).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Correo o usuario")).toBeInvalid();
  });
});

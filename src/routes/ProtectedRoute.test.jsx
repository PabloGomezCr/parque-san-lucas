import React from "react";
import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from "../context/contexts";
import { testUser } from "../test/renderWithProviders";
import { ProtectedRoute } from "./ProtectedRoute";
function LoginDestination() {
  const { state } = useLocation();
  return <p>Login desde {state.from}</p>;
}
describe("ProtectedRoute", () => {
  function mount(isAuthenticated) {
    render(
      <AuthContext.Provider
        value={{ isAuthenticated, user: isAuthenticated ? testUser : null }}
      >
        <MemoryRouter initialEntries={["/tasks?q=prueba"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/tasks" element={<h1>Contenido protegido</h1>} />
            </Route>
            <Route path="/login" element={<LoginDestination />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
  }
  it("sin sesión redirige a login y conserva ruta y búsqueda", async () => {
    mount(false);
    expect(
      await screen.findByText("Login desde /tasks?q=prueba"),
    ).toBeVisible();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
  it("con sesión permite acceder al contenido", () => {
    mount(true);
    expect(
      screen.getByRole("heading", { name: "Contenido protegido" }),
    ).toBeVisible();
  });
});

import { masterActor } from "../test/fixtures/admin";
describe("ProtectedRoute: permisos y sesión activa", () => {
  function mount(user, permission) {
    render(
      <AuthContext.Provider value={{ user, isAuthenticated: true }}>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route
              path="/users"
              element={
                <ProtectedRoute permission={permission}>
                  <h1>Gestión de usuarios</h1>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<h1>Acceso restringido</h1>} />
            <Route path="/login" element={<h1>Iniciar sesión</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
  }
  it("permite acceder a usuarios al MASTER_ADMIN", () => {
    mount(masterActor, "users.view");
    expect(screen.getByText("Gestión de usuarios")).toBeVisible();
  });
  it("rechaza URL directa sin permiso", async () => {
    mount(testUser, "users.view");
    expect(await screen.findByText("Acceso restringido")).toBeVisible();
  });
  it("rechaza sesión desactivada aunque exista un id", async () => {
    mount({ ...masterActor, active: false }, "users.view");
    expect(await screen.findByText("Iniciar sesión")).toBeVisible();
  });
});

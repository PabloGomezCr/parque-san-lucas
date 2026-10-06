import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "../context/contexts";
import { ThemeProvider } from "../context/ThemeContext";
export const testUser = {
  id: "mock-user",
  name: "Persona Ficticia",
  email: "persona@example.test",
  department: "Pruebas",
  role: "Supervisor",
  parkId: "1",
  active: true,
};
// Test helpers are not Fast Refresh entry points.
// oxlint-disable-next-line react/only-export-components
function Destination() {
  const location = useLocation();
  return <p>Destino: {location.pathname}</p>;
}
export function renderWithProviders(
  ui,
  { route = "/", path = route, auth = {} } = {},
) {
  return {
    user: userEvent.setup(),
    ...render(
      <AuthContext.Provider
        value={{ user: testUser, isAuthenticated: true, ...auth }}
      >
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={ui} />
              <Route path="*" element={<Destination />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </AuthContext.Provider>,
    ),
  };
}

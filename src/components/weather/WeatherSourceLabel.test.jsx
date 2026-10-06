import { expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WeatherSourceLabel } from "./WeatherSourceLabel";
import { weatherStatusLabels } from "../../constants/weatherConfig";
for (const [status, label] of Object.entries(weatherStatusLabels)) {
  it(`muestra ${label}`, () => {
    cleanup();
    render(<WeatherSourceLabel status={status} />);
    expect(screen.getByRole("status")).toHaveTextContent(label);
  });
}
it("atribuye proveedor y muestra actualización en la zona del parque", () => {
  cleanup();
  render(
    <WeatherSourceLabel
      status="stale"
      weather={{
        source: "open-meteo",
        timezone: "America/Costa_Rica",
        fetchedAt: "2026-10-06T12:00:00Z",
      }}
    />,
  );
  expect(
    screen.getByRole("link", { name: "Datos meteorológicos: Open-Meteo" }),
  ).toHaveAttribute("href", "https://open-meteo.com/");
  expect(screen.getByText(/Actualización/)).toHaveTextContent("6:00");
});

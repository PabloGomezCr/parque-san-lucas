import { it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useWeather", () => ({ useWeather: vi.fn() }));
import { useAuth } from "../../hooks/useAuth";
import { useWeather } from "../../hooks/useWeather";
import { weatherSnapshot } from "../../test/fixtures/weather";
import { WeatherSummaryCard } from "./WeatherSummaryCard";
it("sin permiso no renderiza ni solicita clima", () => {
  useAuth.mockReturnValue({ user: { parkId: "1" }, can: () => false });
  render(<WeatherSummaryCard />);
  expect(
    screen.queryByText("Información meteorológica"),
  ).not.toBeInTheDocument();
  expect(useWeather).not.toHaveBeenCalled();
});
it("guía autorizado ve fuente, lluvia, viento e impacto y puede actualizar", () => {
  useAuth.mockReturnValue({
    user: { parkId: "1" },
    can: (permission) => permission === "projection.weather.view",
  });
  const refresh = vi.fn();
  useWeather.mockReturnValue({
    status: "live",
    loading: false,
    refresh,
    weather: {
      ...weatherSnapshot.payload,
      daily: [
        {
          time: 1791266400,
          temperatureMax: 31,
          temperatureMin: 24,
          precipitationProbability: 70,
          precipitation: 8,
          weatherCode: 61,
          windSpeed: 20,
        },
      ],
    },
  });
  render(<WeatherSummaryCard />);
  expect(screen.getByRole("status")).toHaveTextContent("En vivo");
  expect(screen.getByText(/Sensación térmica/)).toHaveTextContent(
    "Viento: 12 km/h · Lluvia: 70 %",
  );
  expect(screen.getByText(/Impacto meteorológico estimado/)).toHaveTextContent(
    "Precaución",
  );
  fireEvent.click(screen.getByRole("button", { name: "Actualizar clima" }));
  expect(refresh).toHaveBeenCalledOnce();
});
it("demo explícita muestra Simulado pero nunca genera impacto meteorológico", () => {
  useAuth.mockReturnValue({ user: { parkId: "1" }, can: () => true });
  useWeather.mockReturnValue({
    weather: { ...weatherSnapshot.payload, source: "mock" },
    status: "simulated",
    loading: false,
    refresh: vi.fn(),
  });
  render(<WeatherSummaryCard />);
  expect(screen.getByRole("status")).toHaveTextContent("Simulado");
  expect(
    screen.queryByText(/Impacto meteorológico estimado/),
  ).not.toBeInTheDocument();
});

import { expect, it, vi } from "vitest";
vi.mock("./weatherService", () => ({
  weatherService: { getForecast: vi.fn() },
}));
import { weatherService } from "./weatherService";
import {
  getWeatherImpact,
  getWeatherProjection,
} from "./weatherProjectionService";
import { weatherSnapshot } from "../test/fixtures/weather";
it("no genera impacto sin clima real ni para mocks", () => {
  expect(getWeatherImpact(null)).toBeNull();
  expect(
    getWeatherImpact({ ...weatherSnapshot.payload, source: "mock" }),
  ).toBeNull();
});
it("clasifica clima real con procedencia, confianza y flags separados", () => {
  const impact = getWeatherImpact(
    {
      ...weatherSnapshot.payload,
      daily: [
        {
          time: 1791266400,
          temperatureMax: 31,
          temperatureMin: 24,
          precipitationProbability: 80,
          precipitation: 8,
          weatherCode: 61,
          windSpeed: 20,
        },
      ],
    },
    { isStale: true, isFallback: true },
  );
  expect(impact.level).toBe("CAUTION");
  expect(impact.source).toBe("open-meteo");
  expect(impact.confidence).toBe("low");
  expect(impact.fetchedAt).toBe(weatherSnapshot.payload.fetchedAt);
  expect(impact.isStale).toBe(true);
  expect(impact.isFallback).toBe(true);
  expect(impact.recommendations.well).toContain("wellReadings");
  expect(impact).not.toHaveProperty("wellLevel");
});
it("projection deshabilitada cuando weatherService devuelve WEATHER_UNAVAILABLE", async () => {
  weatherService.getForecast.mockResolvedValue({
    weather: null,
    errorCode: "WEATHER_UNAVAILABLE",
  });
  expect(await getWeatherProjection("1")).toBeNull();
  weatherService.getForecast.mockResolvedValue({
    weather: { ...weatherSnapshot.payload, source: "mock" },
    status: "simulated",
  });
  expect(await getWeatherProjection("1")).toBeNull();
});

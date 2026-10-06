import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createWeatherCache } from "./weatherCache";
import { weatherSnapshot } from "../test/fixtures/weather";
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());
it("soporta miss, hit, expiración y limpieza selectiva", () => {
  const cache = createWeatherCache();
  localStorage.setItem("unrelated", "retained");
  expect(cache.get("1")).toBeUndefined();
  cache.set("1", weatherSnapshot.payload);
  expect(cache.isFresh(cache.get(1))).toBe(true);
  vi.advanceTimersByTime(900000);
  expect(cache.isFresh(cache.get("1"))).toBe(false);
  expect(cache.get("1").weather.source).toBe("open-meteo");
  cache.clear();
  expect(createWeatherCache().get("1")).toBeUndefined();
  expect(localStorage.getItem("unrelated")).toBe("retained");
});
it("persistencia entre instancias conserva fetchedAt y TTL original", () => {
  createWeatherCache().set("1", weatherSnapshot.payload);
  vi.advanceTimersByTime(14 * 60000);
  const entry = createWeatherCache().get("1");
  expect(entry.weather.fetchedAt).toBe(weatherSnapshot.payload.fetchedAt);
  expect(entry.expiresAt).toBe(Date.parse("2026-10-06T12:15:00Z"));
});
it("nunca persiste mocks, parques ajenos ni estructuras incompletas", () => {
  const cache = createWeatherCache();
  expect(cache.set("1", { ...weatherSnapshot.payload, source: "mock" })).toBe(
    false,
  );
  expect(cache.set("2", weatherSnapshot.payload)).toBe(false);
  expect(cache.set("1", { source: "open-meteo" })).toBe(false);
  expect(cache.get("1")).toBeUndefined();
});
it("storage corrupto o bloqueado permite caché en memoria", () => {
  const storage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
  };
  const cache = createWeatherCache({ storage });
  cache.set("1", weatherSnapshot.payload);
  expect(cache.isFresh(cache.get("1"))).toBe(true);
  localStorage.setItem("san-lucas-weather-real-v1:1", "corrupt");
  expect(createWeatherCache().get("1")).toBeUndefined();
});
it("no acepta una fecha futura ni un TTL persistido alterado", () => {
  const cache = createWeatherCache();
  expect(
    cache.set("1", {
      ...weatherSnapshot.payload,
      fetchedAt: "2027-01-01T00:00:00Z",
    }),
  ).toBe(false);
  cache.set("1", weatherSnapshot.payload);
  const key = "san-lucas-weather-real-v1:1";
  const entry = JSON.parse(localStorage.getItem(key));
  entry.expiresAt += 900000;
  localStorage.setItem(key, JSON.stringify(entry));
  expect(createWeatherCache().get("1")).toBeUndefined();
});

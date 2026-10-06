import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createWeatherService } from "./weatherService";
const park = {
  id: "1",
  latitude: 9,
  coordinatesVerified: true,
  longitude: -84,
  timezone: "America/Costa_Rica",
};
import { weatherSnapshot } from "../test/fixtures/weather";
const weather = weatherSnapshot.payload;
let provider, repository, service;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));
  provider = {
    getForecast: vi.fn().mockImplementation(async () => ({
      ...weather,
      fetchedAt: new Date().toISOString(),
    })),
  };
  repository = {
    getPark: vi.fn().mockResolvedValue(park),
    getFallback: vi.fn().mockResolvedValue(null),
  };
  service = createWeatherService({
    provider,
    repository,
    authorize: vi.fn().mockResolvedValue({ parkId: "1" }),
    mode: "open-meteo",
  });
});
afterEach(() => vi.useRealTimers());
it("comparte la consulta concurrente y reutiliza la caché durante 15 minutos", async () => {
  const values = await Promise.all([
    service.getForecast("1"),
    service.getForecast("1"),
  ]);
  expect(values.map((x) => x.status)).toEqual(["live", "live"]);
  expect(provider.getForecast).toHaveBeenCalledTimes(1);
  expect((await service.getForecast("1")).status).toBe("cached");
  vi.advanceTimersByTime(900000);
  await service.getForecast("1");
  expect(provider.getForecast).toHaveBeenCalledTimes(2);
});
it("marca datos anteriores cuando falla el proveedor y evita reintentos por Page", async () => {
  await service.getForecast("1");
  vi.advanceTimersByTime(900000);
  provider.getForecast.mockRejectedValue(new Error("offline"));
  expect((await service.getForecast("1")).status).toBe("stale");
  expect((await service.getForecast("1")).isStale).toBe(true);
  expect(provider.getForecast).toHaveBeenCalledTimes(2);
});
it("API fallida no activa fallback automático a db.json", async () => {
  provider.getForecast.mockRejectedValue(new Error("offline"));
  repository.getFallback.mockResolvedValue({ ...weather, source: "mock" });
  expect((await service.getForecast("1")).errorCode).toBe(
    "WEATHER_UNAVAILABLE",
  );
  expect(repository.getFallback).not.toHaveBeenCalled();
});
it("devuelve No disponible sin datos y controla el cooldown manual", async () => {
  provider.getForecast.mockRejectedValue(new Error("offline"));
  expect((await service.getForecast("1")).status).toBe("unavailable");
  await service.getForecast("1", { force: true });
  expect(provider.getForecast).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(60000);
  await service.getForecast("1", { force: true });
  expect(provider.getForecast).toHaveBeenCalledTimes(2);
});
it("permite actualización manual fuera del cooldown y omite caché", async () => {
  await service.getForecast("1");
  vi.advanceTimersByTime(60000);
  expect((await service.getForecast("1", { force: true })).status).toBe("live");
  expect(provider.getForecast).toHaveBeenCalledTimes(2);
});
it("no llama al proveedor sin coordenadas", async () => {
  repository.getPark.mockResolvedValue({ id: "1" });
  expect((await service.getForecast("1")).error).toBe(
    "Ubicación meteorológica no configurada.",
  );
  expect(provider.getForecast).not.toHaveBeenCalled();
});
it("rechaza acceso a otro parque antes de consultar", async () => {
  await expect(service.getForecast("2")).rejects.toThrow("no pertenece");
  expect(repository.getPark).not.toHaveBeenCalled();
});
it("rechaza llamadas sin permiso antes de consultar", async () => {
  service = createWeatherService({
    provider,
    repository,
    authorize: vi.fn().mockRejectedValue(new Error("Sin permiso")),
  });
  await expect(service.getForecast("1")).rejects.toThrow("Sin permiso");
  expect(provider.getForecast).not.toHaveBeenCalled();
});
it("API fallida con caché vigente conserva el estado En caché", async () => {
  await service.getForecast("1");
  vi.advanceTimersByTime(60000);
  provider.getForecast.mockRejectedValue(new Error("offline"));
  expect((await service.getForecast("1", { force: true })).status).toBe(
    "cached",
  );
  expect((await service.getForecast("1")).isStale).toBe(false);
  expect(provider.getForecast).toHaveBeenCalledTimes(2);
});
it("rechaza mocks del proveedor aunque allowMock=true en modo open-meteo", async () => {
  service = createWeatherService({
    repository,
    provider,
    authorize: vi.fn().mockResolvedValue({ parkId: "1" }),
    mode: "open-meteo",
    allowMock: true,
  });
  provider.getForecast.mockResolvedValue({ ...weather, source: "mock" });
  expect((await service.getForecast("1")).weather).toBeNull();
  expect(repository.getFallback).not.toHaveBeenCalled();
});
it("mock requiere modo explícito y allowMock=true; no puede activarse en producción", async () => {
  const options = {
    repository,
    provider,
    authorize: vi.fn().mockResolvedValue({ parkId: "1" }),
    mode: "mock",
  };
  expect(
    (
      await createWeatherService({ ...options, allowMock: false }).getForecast(
        "1",
      )
    ).errorCode,
  ).toBe("WEATHER_CONFIGURATION_ERROR");
  expect(
    (
      await createWeatherService({
        ...options,
        allowMock: true,
        isProduction: true,
      }).getForecast("1")
    ).weather,
  ).toBeNull();
  expect(provider.getForecast).not.toHaveBeenCalled();
  provider.getForecast.mockResolvedValue({ ...weather, source: "mock" });
  expect(
    (
      await createWeatherService({
        ...options,
        allowMock: true,
        isProduction: false,
      }).getForecast("1")
    ).status,
  ).toBe("simulated");
});
it("recarga de navegador reutiliza caché real persistida sin extender TTL", async () => {
  await service.getForecast("1");
  vi.advanceTimersByTime(60000);
  const second = createWeatherService({
    provider,
    repository,
    authorize: vi.fn().mockResolvedValue({ parkId: "1" }),
    mode: "open-meteo",
  });
  const cached = await second.getForecast("1");
  expect(cached.status).toBe("cached");
  expect(cached.expiresAt).toBe("2026-10-06T12:15:00.000Z");
  expect(provider.getForecast).toHaveBeenCalledTimes(1);
});
it("coordenadas no verificadas no alcanzan la API", async () => {
  repository.getPark.mockResolvedValue({ ...park, coordinatesVerified: false });
  expect((await service.getForecast("1")).errorCode).toBe(
    "WEATHER_CONFIGURATION_ERROR",
  );
  expect(provider.getForecast).not.toHaveBeenCalled();
});

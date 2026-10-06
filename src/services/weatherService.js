import { requireActor } from "./sessionAccess";
import { weatherRepository } from "../repositories/weatherRepository";
import {
  openMeteoProvider,
  validateWeatherLocation,
} from "../providers/weather/openMeteoProvider";
import { mockWeatherProvider } from "../providers/weather/mockWeatherProvider";
import { weatherConfig, weatherError } from "../constants/weatherConfig";
import { createWeatherCache } from "../utils/weatherCache";
import { isValidWeather } from "../utils/weatherMapper";
/** Providers implement getForecast(park) -> normalized weather. A future proxy can implement this interface. */
export function createWeatherService({
  repository = weatherRepository,
  provider,
  cache = createWeatherCache(),
  authorize = requireActor,
  mode = weatherConfig.provider,
  allowMock = weatherConfig.allowMock,
  isProduction = import.meta.env.PROD,
} = {}) {
  const inFlight = new Map(),
    attempts = new Map(),
    results = new Map();
  const result = (
    weather,
    status,
    error = null,
    errorCode = null,
    expiresAt = null,
    isFallback = false,
  ) => ({
    weather,
    status,
    error,
    errorCode,
    expiresAt,
    source: weather?.source || null,
    fetchedAt: weather?.fetchedAt || null,
    lastUpdated: weather?.fetchedAt || null,
    isFallback,
    isStale: status === "stale",
  });
  return {
    async getForecast(parkId, { force = false } = {}) {
      const actor = await authorize("projection.weather.view");
      const key = String(parkId || actor.parkId);
      if (key !== String(actor.parkId))
        throw new Error("El registro no pertenece a tu parque.");
      if (inFlight.has(key)) return inFlight.get(key);
      const promise = (async () => {
        let output, entry;
        try {
          const park = await repository.getPark(key);
          if (mode === "mock" && (!allowMock || isProduction))
            throw weatherError(
              "WEATHER_CONFIGURATION_ERROR",
              "El clima simulado no está habilitado.",
            );
          if (!["open-meteo", "mock"].includes(mode))
            throw weatherError(
              "WEATHER_CONFIGURATION_ERROR",
              "Proveedor meteorológico no configurado.",
            );
          if (mode === "open-meteo") {
            validateWeatherLocation(park);
            if (park.coordinatesVerified !== true)
              throw weatherError(
                "WEATHER_CONFIGURATION_ERROR",
                "Coordenadas meteorológicas pendientes de verificación.",
              );
            entry = cache.get(key);
            if (!force && cache.isFresh(entry))
              return result(
                entry.weather,
                "cached",
                null,
                null,
                new Date(entry.expiresAt).toISOString(),
              );
          }
          const interval = force ? weatherConfig.cooldown : weatherConfig.ttl;
          if (
            attempts.has(key) &&
            Date.now() - attempts.get(key) < interval &&
            (force ||
              !results.get(key)?.weather ||
              ["stale", "simulated", "unavailable"].includes(
                results.get(key)?.status,
              ))
          )
            return (
              results.get(key) ||
              result(
                null,
                "unavailable",
                "Información meteorológica no disponible",
                "WEATHER_UNAVAILABLE",
              )
            );
          attempts.set(key, Date.now());
          const selectedProvider =
            provider ||
            (mode === "mock" ? mockWeatherProvider : openMeteoProvider);
          const weather = await selectedProvider.getForecast(park, {
            allowMock: mode === "mock" && allowMock && !isProduction,
          });
          if (
            !isValidWeather(weather) ||
            String(weather.parkId) !== key ||
            (mode === "open-meteo" && weather.source !== "open-meteo") ||
            (mode === "mock" && weather.source !== "mock")
          )
            throw weatherError(
              "WEATHER_NO_DATA",
              "Información meteorológica no disponible",
            );
          if (mode === "mock") output = result(weather, "simulated");
          else {
            cache.set(key, weather);
            const updated = cache.get(key);
            if (!updated)
              throw weatherError(
                "WEATHER_NO_DATA",
                "Información meteorológica no disponible",
              );
            output = result(
              weather,
              cache.isFresh(updated) ? "live" : "stale",
              null,
              null,
              new Date(updated.expiresAt).toISOString(),
            );
          }
        } catch (error) {
          if (error.code === "WEATHER_CONFIGURATION_ERROR")
            output = result(null, "unavailable", error.message, error.code);
          else {
            attempts.set(key, Date.now());
            // Only genuine Open-Meteo data can survive a failed request. No automatic db.json fallback.
            entry = mode === "open-meteo" ? cache.get(key) : undefined;
            output = entry
              ? result(
                  entry.weather,
                  cache.isFresh(entry) ? "cached" : "stale",
                  "No se pudo actualizar la información meteorológica.",
                  null,
                  new Date(entry.expiresAt).toISOString(),
                  true,
                )
              : result(
                  null,
                  "unavailable",
                  "Información meteorológica no disponible",
                  "WEATHER_UNAVAILABLE",
                );
          }
        }
        results.set(key, output);
        return output;
      })();
      inFlight.set(key, promise);
      try {
        return await promise;
      } finally {
        inFlight.delete(key);
      }
    },
  };
}
export const weatherService = createWeatherService();

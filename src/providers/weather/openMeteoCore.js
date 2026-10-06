import {
  weatherFields,
  weatherError,
  mapWeather,
} from "../../utils/weatherModel.js";
export const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
export function validateWeatherLocation(park) {
  if (
    !Number.isFinite(park?.latitude) ||
    !Number.isFinite(park?.longitude) ||
    Math.abs(park.latitude) > 90 ||
    Math.abs(park.longitude) > 180
  )
    throw weatherError(
      "WEATHER_CONFIGURATION_ERROR",
      "Ubicación meteorológica no configurada.",
    );
  try {
    new Intl.DateTimeFormat("es-CR", {
      timeZone: park.timezone || "America/Costa_Rica",
    });
  } catch {
    throw weatherError(
      "WEATHER_CONFIGURATION_ERROR",
      "Zona horaria meteorológica no configurada.",
    );
  }
}
export function createOpenMeteoProvider(weatherConfig) {
  return {
    async getForecast(park) {
      validateWeatherLocation(park);
      const params = new URLSearchParams({
        latitude: park.latitude,
        longitude: park.longitude,
        timezone: park.timezone || "America/Costa_Rica",
        forecast_days: weatherConfig.forecastDays,
        timeformat: "unixtime",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
        ...Object.fromEntries(
          Object.entries(weatherFields).map(([section, fields]) => [
            section,
            Object.values(fields).join(","),
          ]),
        ),
      });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), weatherConfig.timeout);
      try {
        const response = await fetch(`${weatherConfig.baseUrl}?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok)
          throw weatherError(
            "WEATHER_PROVIDER_ERROR",
            "El proveedor meteorológico no está disponible.",
          );
        return mapWeather(await response.json(), park);
      } catch (error) {
        if (controller.signal.aborted)
          throw weatherError(
            "WEATHER_TIMEOUT",
            "El proveedor meteorológico tardó demasiado en responder.",
          );
        if (error.code) throw error;
        throw weatherError(
          "WEATHER_PROVIDER_ERROR",
          "No se pudo consultar el proveedor meteorológico.",
        );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

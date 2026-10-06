import { OPEN_METEO_BASE_URL } from "../providers/weather/openMeteoCore.js";
const positive = (value, fallback) =>
  Number(value) > 0 ? Number(value) : fallback;
export const weatherConfig = {
  provider: import.meta.env.VITE_WEATHER_PROVIDER || "open-meteo",
  allowMock:
    import.meta.env.VITE_ALLOW_MOCK_WEATHER === "true" && !import.meta.env.PROD,
  baseUrl: OPEN_METEO_BASE_URL,
  ttl: positive(import.meta.env.VITE_WEATHER_CACHE_TTL_MS, 900000),
  timeout: 9000,
  cooldown: 60000,
  forecastDays: 7,
};
export { weatherFields, weatherError } from "../utils/weatherModel.js";

export const weatherStatusLabels = {
  live: "En vivo",
  cached: "En caché",
  stale: "Última información disponible",
  simulated: "Simulado",
  unavailable: "No disponible",
};

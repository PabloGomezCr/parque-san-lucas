import { isValidWeather } from "../utils/weatherMapper";
import { weatherService } from "./weatherService";
export async function getWeatherProjection(parkId) {
  const result = await weatherService.getForecast(parkId);
  const impact = getWeatherImpact(result.weather, {
    isStale: result.isStale,
    isFallback: result.isFallback,
  });
  return impact
    ? {
        ...impact,
        status: result.status,
        isStale: result.isStale,
        isFallback: result.isFallback,
      }
    : null;
}
export function getWeatherImpact(
  weather,
  { isStale = false, isFallback = false } = {},
) {
  if (weather?.source !== "open-meteo" || !isValidWeather(weather)) return null;
  const current = weather.current;
  const day = weather.daily?.[0];
  const rain = day?.precipitationProbability ?? null;
  const level =
    current.weatherCode >= 95 ||
    current.windGusts >= 60 ||
    (day?.precipitation ?? 0) >= 50
      ? "HIGH_IMPACT"
      : rain >= 70 || current.windGusts >= 40
        ? "CAUTION"
        : rain >= 40
          ? "WATCH"
          : "NORMAL";
  return {
    level,
    confidence: isStale || isFallback || !day ? "low" : "medium",
    isStale,
    isFallback,
    source: weather.source,
    fetchedAt: weather.fetchedAt,
    factors: {
      precipitationProbability: rain,
      windGusts: current.windGusts,
      relativeHumidity: current.relativeHumidity,
    },
    recommendations: {
      tours:
        level === "NORMAL"
          ? "Verificar condiciones antes de iniciar recorridos."
          : "Revisar lluvia, viento y condiciones de los senderos antes del recorrido.",
      visitors:
        "Considerar el pronóstico junto con la afluencia registrada; no estima cantidades de visitantes.",
      maintenance:
        "Revisar drenajes y trabajos expuestos según lluvia y viento.",
      biodiversity:
        "Planificar observaciones según condiciones meteorológicas y registros de especies.",
      heritage:
        "Considerar inspecciones por humedad y lluvia junto con incidencias registradas.",
      well: "Usar precipitación como contexto; los niveles y caudales provienen de wellReadings.",
    },
  };
}

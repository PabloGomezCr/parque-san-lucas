import "./weather.scss";
import { useAuth } from "../../hooks/useAuth";
import { useWeather } from "../../hooks/useWeather";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { WeatherSourceLabel } from "./WeatherSourceLabel";
import { weatherCondition } from "../../constants/weatherCodes";
import { weatherNumber, weatherTime } from "../../utils/weatherFormatting";
import { getWeatherImpact } from "../../services/weatherProjectionService";
export function WeatherSummaryCard({ variant = "compact" }) {
  const { user, can } = useAuth();
  return can("projection.weather.view") ? (
    <WeatherCard parkId={user.parkId} variant={variant} />
  ) : null;
}
function WeatherCard({ parkId, variant }) {
  const { weather, loading, error, status, refresh, isStale, isFallback } =
    useWeather(parkId);
  const impact = getWeatherImpact(weather, { isStale, isFallback });
  const labels = {
    NORMAL: "Normal",
    WATCH: "Vigilancia",
    CAUTION: "Precaución",
    HIGH_IMPACT: "Impacto alto",
  };
  return (
    <Card title="Información meteorológica" className="weather-card">
      <div className="stack">
        <WeatherSourceLabel weather={weather} status={status} />
        {loading && <LoadingSkeleton rows={2} />}
        {error && <p role="alert">{error}</p>}
        {weather && (
          <>
            <strong>
              {weatherCondition(weather.current.weatherCode)} ·{" "}
              {weatherNumber(weather.current.temperature, "°C")}
            </strong>
            <p>
              Sensación térmica:{" "}
              {weatherNumber(weather.current.apparentTemperature, "°C")} ·
              Viento: {weatherNumber(weather.current.windSpeed, "km/h")} ·
              Lluvia:{" "}
              {weatherNumber(weather.daily[0]?.precipitationProbability, "%")}
            </p>
            {impact && (
              <>
                <span className="badge">
                  Impacto meteorológico estimado: {labels[impact.level]}
                </span>
                <p>{impact.recommendations.tours}</p>
              </>
            )}
            {variant === "detailed" && (
              <ul>
                {weather.daily.slice(0, 7).map((day) => (
                  <li key={day.time}>
                    {weatherTime(day.time, weather.timezone)} ·{" "}
                    {weatherNumber(day.temperatureMin, "°C")} –{" "}
                    {weatherNumber(day.temperatureMax, "°C")} · Lluvia{" "}
                    {weatherNumber(day.precipitationProbability, "%")}
                  </li>
                ))}
              </ul>
            )}
            <details>
              <summary>Próximas horas del pronóstico</summary>
              <ul>
                {weather.hourly
                  .filter(
                    (hour) =>
                      hour.time >=
                      (status === "simulated" || status === "stale"
                        ? weather.observedAt || 0
                        : Date.parse(weather.fetchedAt) / 1000),
                  )
                  .slice(0, 6)
                  .map((hour) => (
                    <li key={hour.time}>
                      {weatherTime(hour.time, weather.timezone)} ·{" "}
                      {weatherCondition(hour.weatherCode)} · Lluvia{" "}
                      {weatherNumber(hour.precipitationProbability, "%")} ·
                      Viento {weatherNumber(hour.windSpeed, "km/h")}
                    </li>
                  ))}
              </ul>
            </details>
          </>
        )}
        <Button variant="secondary" disabled={loading} onClick={refresh}>
          Actualizar clima
        </Button>
        <small>
          Caché local de 15 minutos por navegador. Actualización manual limitada
          a una por minuto.
        </small>
        <small>
          Coordenadas:{" "}
          <a href="https://www.openstreetmap.org/copyright">
            © OpenStreetMap contributors
          </a>
        </small>
      </div>
    </Card>
  );
}

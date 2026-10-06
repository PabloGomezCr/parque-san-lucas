import { weatherTime } from "../../utils/weatherFormatting";
import { weatherStatusLabels } from "../../constants/weatherConfig";
export function WeatherSourceLabel({ weather, status }) {
  return (
    <div className="stack">
      <span className="badge" role="status">
        {weatherStatusLabels[status] || weatherStatusLabels.unavailable}
      </span>
      {weather && (
        <small>
          Actualización: {weatherTime(weather.fetchedAt, weather.timezone)} ·{" "}
          {weather.source === "open-meteo" ? (
            <>
              <a href="https://open-meteo.com/">
                Datos meteorológicos: Open-Meteo
              </a>{" "}
              ·{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/">
                CC BY 4.0
              </a>
            </>
          ) : weather.source === "mock" ? (
            "Fuente: registros simulados (db.json)"
          ) : (
            "Fuente: registros guardados"
          )}
        </small>
      )}
    </div>
  );
}

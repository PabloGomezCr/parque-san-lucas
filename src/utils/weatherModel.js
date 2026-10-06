export const weatherFields = {
  current: {
    temperature: "temperature_2m",
    apparentTemperature: "apparent_temperature",
    relativeHumidity: "relative_humidity_2m",
    precipitation: "precipitation",
    weatherCode: "weather_code",
    cloudCover: "cloud_cover",
    windSpeed: "wind_speed_10m",
    windDirection: "wind_direction_10m",
    windGusts: "wind_gusts_10m",
  },
  hourly: {
    temperature: "temperature_2m",
    precipitationProbability: "precipitation_probability",
    precipitation: "precipitation",
    weatherCode: "weather_code",
    windSpeed: "wind_speed_10m",
  },
  daily: {
    temperatureMax: "temperature_2m_max",
    temperatureMin: "temperature_2m_min",
    precipitation: "precipitation_sum",
    precipitationProbability: "precipitation_probability_max",
    weatherCode: "weather_code",
    windSpeed: "wind_speed_10m_max",
  },
};
export const weatherError = (code, message) =>
  Object.assign(new Error(message), { code });

export function isValidWeather(weather) {
  try {
    new Intl.DateTimeFormat("es-CR", { timeZone: weather?.timezone });
  } catch {
    return false;
  }
  return Boolean(
    weather?.parkId &&
    Number.isFinite(Date.parse(weather.fetchedAt)) &&
    weather.timezone &&
    weather.current &&
    Object.keys(weatherFields.current).every((key) =>
      Number.isFinite(weather.current[key]),
    ) &&
    Array.isArray(weather.hourly) &&
    Array.isArray(weather.daily) &&
    ["hourly", "daily"].every((section) =>
      weather[section].every(
        (row) =>
          Number.isFinite(row.time) &&
          Object.keys(weatherFields[section]).every((key) =>
            Number.isFinite(row[key]),
          ),
      ),
    ),
  );
}
export function mapWeather(payload, park) {
  const map = (section, index) =>
    Object.fromEntries(
      Object.entries(weatherFields[section]).map(([key, field]) => [
        key,
        index === undefined
          ? payload[section]?.[field]
          : payload[section]?.[field]?.[index],
      ]),
    );
  const series = (section) => {
    if (!Array.isArray(payload[section]?.time) || !payload[section].time.length)
      throw weatherError(
        "WEATHER_NO_DATA",
        "Pronóstico meteorológico incompleto.",
      );
    return payload[section].time.map((time, index) => {
      const row = { time, ...map(section, index) };
      if (
        !Number.isFinite(time) ||
        Object.keys(weatherFields[section]).some(
          (key) => !Number.isFinite(row[key]),
        )
      )
        throw weatherError(
          "WEATHER_NO_DATA",
          "Pronóstico meteorológico incompleto.",
        );
      return row;
    });
  };
  const weather = {
    parkId: String(park.id),
    source: "open-meteo",
    fetchedAt: new Date().toISOString(),
    timezone: park.timezone || "America/Costa_Rica",
    observedAt: payload.current?.time,
    current: map("current"),
    hourly: series("hourly"),
    daily: series("daily"),
  };
  if (!isValidWeather(weather) || !Number.isFinite(weather.observedAt))
    throw weatherError(
      "WEATHER_NO_DATA",
      "No existe información meteorológica válida.",
    );
  return weather;
}

export const verifiedWeatherPark = {
  id: "1",
  latitude: 9.9404316,
  longitude: -84.9060651,
  timezone: "America/Costa_Rica",
  coordinatesVerified: true,
};
export const weatherSnapshot = {
  park_id: "1",
  source: "open-meteo",
  fetched_at: "2026-10-06T12:00:00.000Z",
  expires_at: "2026-10-06T12:15:00.000Z",
  status: "LIVE",
  payload: {
    parkId: "1",
    source: "open-meteo",
    fetchedAt: "2026-10-06T12:00:00.000Z",
    timezone: "America/Costa_Rica",
    observedAt: 1791288000,
    current: {
      temperature: 29,
      apparentTemperature: 31,
      relativeHumidity: 74,
      precipitation: 0,
      weatherCode: 2,
      cloudCover: 45,
      windSpeed: 12,
      windDirection: 180,
      windGusts: 20,
    },
    hourly: [],
    daily: [],
  },
};

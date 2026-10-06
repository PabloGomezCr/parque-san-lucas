import { weatherConfig } from "../constants/weatherConfig";
import { isValidWeather } from "./weatherMapper";
const namespace = "san-lucas-weather-real-v1:";
const browserStorage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};
export function createWeatherCache({
  storage = browserStorage(),
  ttl = weatherConfig.ttl,
} = {}) {
  const records = new Map();
  const valid = (key, entry) =>
    Boolean(
      entry &&
      isValidWeather(entry.weather) &&
      entry.weather.source === "open-meteo" &&
      String(entry.weather.parkId) === String(key) &&
      Number.isFinite(entry.expiresAt) &&
      entry.expiresAt === Date.parse(entry.weather.fetchedAt) + ttl &&
      Date.parse(entry.weather.fetchedAt) <= Date.now() + 60000,
    );
  return {
    get(key) {
      key = String(key);
      let stored;
      try {
        stored = JSON.parse(storage?.getItem(namespace + key) || "null");
      } catch {
        /* Corrupt/blocked storage is ignored. */
      }
      if (
        valid(key, stored) &&
        (!records.has(key) || stored.expiresAt > records.get(key).expiresAt)
      )
        records.set(key, stored);
      const entry = records.get(key);
      if (!valid(key, entry)) {
        records.delete(key);
        return undefined;
      }
      return entry;
    },
    set(key, weather) {
      key = String(key);
      const entry = {
        weather,
        savedAt: Date.now(),
        expiresAt: Date.parse(weather?.fetchedAt) + ttl,
      };
      if (!valid(key, entry)) return false;
      records.set(key, entry);
      try {
        storage?.setItem(namespace + key, JSON.stringify(entry));
      } catch {
        /* Memory cache survives storage quota/access errors. */
      }
      return true;
    },
    isFresh: (entry) => Boolean(entry && Date.now() < entry.expiresAt),
    clear() {
      records.clear();
      try {
        for (let index = storage.length - 1; index >= 0; index--) {
          const key = storage.key(index);
          if (key?.startsWith(namespace)) storage.removeItem(key);
        }
      } catch {
        /* Optional storage. */
      }
    },
  };
}

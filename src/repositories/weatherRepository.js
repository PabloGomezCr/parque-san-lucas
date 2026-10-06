import { createRepository } from "./createRepository";
import { isValidWeather } from "../utils/weatherMapper";
const parks = createRepository({ resource: "parks" });
const forecasts = createRepository({ resource: "weatherForecasts" });
export const weatherRepository = {
  getPark: (id) => parks.getById(id),
  async getFallback(parkId) {
    return (
      (await forecasts.getAll())
        .filter(
          (item) =>
            String(item.parkId) === String(parkId) && isValidWeather(item),
        )
        .sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt))[0] ||
      null
    );
  },
};

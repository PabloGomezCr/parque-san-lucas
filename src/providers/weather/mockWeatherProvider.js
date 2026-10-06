import { weatherRepository } from "../../repositories/weatherRepository";
import { weatherError, weatherConfig } from "../../constants/weatherConfig";
export const mockWeatherProvider = {
  async getForecast(park, { allowMock = weatherConfig.allowMock } = {}) {
    if (!allowMock || import.meta.env.PROD)
      throw weatherError(
        "WEATHER_CONFIGURATION_ERROR",
        "El clima simulado no está habilitado.",
      );
    const weather = await weatherRepository.getFallback(park.id);
    if (!weather)
      throw weatherError(
        "WEATHER_NO_DATA",
        "No hay datos meteorológicos simulados disponibles.",
      );
    return { ...weather, source: "mock" };
  },
};

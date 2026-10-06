import { weatherConfig } from "../../constants/weatherConfig";
import { createOpenMeteoProvider } from "./openMeteoCore.js";
export { validateWeatherLocation } from "./openMeteoCore.js";
export const openMeteoProvider = createOpenMeteoProvider(weatherConfig);

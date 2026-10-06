import { afterEach, expect, it, vi } from "vitest";
import { openMeteoProvider } from "./openMeteoProvider";
import { weatherFields } from "../../constants/weatherConfig";
import { mapWeather } from "../../utils/weatherMapper";
const park = {
  id: "1",
  latitude: 9,
  longitude: -84,
  timezone: "America/Costa_Rica",
};
const payload = Object.fromEntries(
  Object.entries(weatherFields).map(([section, fields]) => [
    section,
    {
      time: section === "current" ? 1791288000 : [1791288000],
      ...Object.fromEntries(
        Object.values(fields).map((field) => [
          field,
          section === "current" ? 20 : [20],
        ]),
      ),
    },
  ]),
);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("construye parámetros y normaliza unidades, hourly y daily", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => payload });
  vi.stubGlobal("fetch", fetch);
  const weather = await openMeteoProvider.getForecast(park);
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.origin).toBe("https://api.open-meteo.com");
  expect(url.searchParams.get("timezone")).toBe(park.timezone);
  expect(url.searchParams.get("forecast_days")).toBe("7");
  expect(url.searchParams.get("timeformat")).toBe("unixtime");
  expect(url.searchParams.get("latitude")).toBe("9");
  expect(url.searchParams.get("wind_speed_unit")).toBe("kmh");
  expect(weather.current.temperature).toBe(20);
  expect(weather.hourly[0].precipitationProbability).toBe(20);
  expect(weather.daily[0].temperatureMax).toBe(20);
});
it("rechaza datos malformados", () =>
  expect(() => mapWeather({}, park)).toThrow());
it("controla HTTP 4xx sin reintentar", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
  vi.stubGlobal("fetch", fetch);
  await expect(openMeteoProvider.getForecast(park)).rejects.toMatchObject({
    code: "WEATHER_PROVIDER_ERROR",
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("cancela al alcanzar timeout", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (url, { signal }) =>
        new Promise((resolve, reject) =>
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    ),
  );
  const assertion = expect(
    openMeteoProvider.getForecast(park),
  ).rejects.toMatchObject({ code: "WEATHER_TIMEOUT" });
  await vi.advanceTimersByTimeAsync(9000);
  await assertion;
});

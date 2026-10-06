import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
vi.mock("../services/weatherService", () => ({
  weatherService: { getForecast: vi.fn() },
}));
import { weatherService } from "../services/weatherService";
import { useWeather } from "./useWeather";
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());
it("actualiza al vencer el TTL restante del snapshot compartido", async () => {
  weatherService.getForecast.mockResolvedValue({
    weather: { source: "open-meteo" },
    status: "cached",
    isStale: false,
    expiresAt: "2026-10-06T12:01:00Z",
  });
  const hook = renderHook(() => useWeather("1"));
  await act(async () => {});
  expect(hook.result.current.status).toBe("cached");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(59999);
  });
  expect(weatherService.getForecast).toHaveBeenCalledTimes(1);
  weatherService.getForecast.mockResolvedValue({
    weather: { source: "open-meteo" },
    status: "live",
    isStale: false,
    expiresAt: "2026-10-06T12:16:00Z",
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(weatherService.getForecast).toHaveBeenCalledTimes(2);
  expect(hook.result.current.status).toBe("live");
  hook.unmount();
});
it("mock y unmount no generan bucles de actualización por fechas antiguas", async () => {
  weatherService.getForecast.mockResolvedValue({
    weather: { source: "mock" },
    status: "simulated",
    expiresAt: "2020-01-01T00:00:00Z",
  });
  const hook = renderHook(() => useWeather("1"));
  await act(async () => {});
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(weatherService.getForecast).toHaveBeenCalledTimes(1);
  hook.unmount();
  await vi.advanceTimersByTimeAsync(900000);
  expect(weatherService.getForecast).toHaveBeenCalledTimes(1);
});

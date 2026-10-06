import { useCallback, useEffect, useState } from "react";
import { weatherService } from "../services/weatherService";
import { weatherConfig } from "../constants/weatherConfig";
export function useWeather(parkId) {
  const [state, setState] = useState({
    weather: null,
    status: "unavailable",
    loading: true,
  });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true,
      timer;
    const load = async (force = false) => {
      setState((previous) => ({
        ...previous,
        loading: true,
        ...(previous.weather?.source !== "mock" &&
        previous.expiresAt &&
        Date.parse(previous.expiresAt) <= Date.now()
          ? { status: "stale", isStale: true }
          : {}),
      }));
      let delay = weatherConfig.ttl;
      try {
        const result = await weatherService.getForecast(parkId, { force });
        if (active) {
          setState({ ...result, loading: false });
          if (
            result.expiresAt &&
            !result.isStale &&
            result.weather?.source !== "mock"
          )
            delay = Math.max(
              1000,
              Math.min(
                weatherConfig.ttl,
                Date.parse(result.expiresAt) - Date.now(),
              ),
            );
        }
      } catch {
        if (active)
          setState({
            weather: null,
            status: "unavailable",
            error: "No se pudo consultar la información meteorológica.",
            loading: false,
          });
      }
      if (active) timer = setTimeout(() => load(), delay);
    };
    load(revision > 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [parkId, revision]);
  return { ...state, refresh };
}

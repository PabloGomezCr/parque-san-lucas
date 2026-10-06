// @vitest-environment node
import { it, expect, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  selectSanLucasCoordinates,
  resolveParkCoordinates,
} from "../../scripts/resolveParkCoordinates.mjs";
import results from "../../docs/geography/san-lucas-nominatim.json";
it("valida nombre, tipo, país, boundingbox y coordenadas del resultado único", () => {
  expect(selectSanLucasCoordinates(results)).toMatchObject({
    latitude: 9.9404316,
    longitude: -84.9060651,
    coordinatesVerified: true,
  });
});
it("detiene resultados ambiguos y vacíos", () => {
  expect(() => selectSanLucasCoordinates([...results, ...results])).toThrow(
    "ambiguo",
  );
  expect(() => selectSanLucasCoordinates([])).toThrow("Sin resultados");
  expect(() =>
    selectSanLucasCoordinates([{ ...results[0], lat: "40" }]),
  ).toThrow("fuera del área");
});
it("usa respuesta guardada sin repetir Nominatim", async () => {
  const fetchImpl = vi.fn();
  await resolveParkCoordinates({ fetchImpl });
  expect(fetchImpl).not.toHaveBeenCalled();
});
it("controla HTTP y consulta única identificada cuando falta archivo", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sanlucas-geocode-"));
  try {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => results });
    const options = { fetchImpl, cachePath: join(dir, "result.json") };
    await expect(resolveParkCoordinates(options)).rejects.toThrow(
      "No se pudo resolver",
    );
    await resolveParkCoordinates(options);
    await resolveParkCoordinates(options);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1][1].headers["User-Agent"]).toContain(
      "ParqueNacional-SanLucas",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

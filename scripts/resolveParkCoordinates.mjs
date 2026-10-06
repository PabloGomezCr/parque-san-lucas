// Deliberate one-time resolution only. Uses the checked-in response on subsequent runs.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
export function selectSanLucasCoordinates(results) {
  if (!Array.isArray(results) || !results.length)
    throw new Error("Sin resultados geográficos.");
  const matches = results.filter(
    (row) =>
      row.name === "Parque Nacional Isla San Lucas" &&
      (row.category || row.class) === "boundary" &&
      row.type === "national_park" &&
      row.address?.country_code === "cr" &&
      row.display_name?.includes("Costa Rica"),
  );
  if (matches.length !== 1)
    throw new Error(
      "Resultado geográfico ambiguo; requiere validación humana.",
    );
  const row = matches[0];
  const latitude = Number(row.lat),
    longitude = Number(row.lon);
  const bounds = row.boundingbox?.map(Number);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !bounds ||
    bounds.length !== 4 ||
    !bounds.every(Number.isFinite) ||
    latitude < bounds[0] ||
    latitude > bounds[1] ||
    longitude < bounds[2] ||
    longitude > bounds[3] ||
    latitude < 9.9 ||
    latitude > 10 ||
    longitude < -85 ||
    longitude > -84.8
  )
    throw new Error("Coordenadas fuera del área esperada del parque.");
  return {
    latitude,
    longitude,
    timezone: "America/Costa_Rica",
    coordinatesVerified: true,
    coordinatesSource: "OpenStreetMap/Nominatim",
    coordinatesReference: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    boundingbox: bounds,
  };
}
export async function resolveParkCoordinates({
  fetchImpl = fetch,
  cachePath = new URL(
    "../docs/geography/san-lucas-nominatim.json",
    import.meta.url,
  ),
  userAgent = "ParqueNacional-SanLucas/0.1 (one-time park coordinate verification)",
} = {}) {
  let results;
  try {
    results = JSON.parse(await readFile(cachePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
      q: "Parque Nacional Isla San Lucas, Costa Rica",
      format: "jsonv2",
      addressdetails: "1",
      limit: "5",
    });
    const response = await fetchImpl(url, {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw new Error("No se pudo resolver la ubicación geográfica.");
    results = await response.json();
    await writeFile(cachePath, JSON.stringify(results, null, 2) + "\n");
  }
  return selectSanLucasCoordinates(results);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await resolveParkCoordinates(), null, 2));
  console.log(
    "Coordenadas: © OpenStreetMap contributors — https://www.openstreetmap.org/copyright",
  );
}

import { test, expect } from "@playwright/test";
import { weatherSnapshot } from "../src/test/fixtures/weather.js";
import { weatherFields } from "../src/utils/weatherModel.js";
const cacheKey = "san-lucas-weather-real-v1:1";
const payload = () => {
  const now = Math.floor(Date.now() / 1000);
  const values = {
    current: weatherSnapshot.payload.current,
    hourly: {
      temperature: 29,
      precipitationProbability: 70,
      precipitation: 2,
      weatherCode: 61,
      windSpeed: 12,
    },
    daily: {
      temperatureMax: 31,
      temperatureMin: 24,
      precipitation: 8,
      precipitationProbability: 70,
      weatherCode: 61,
      windSpeed: 20,
    },
  };
  return Object.fromEntries(
    Object.entries(weatherFields).map(([section, fields]) => [
      section,
      {
        time: section === "current" ? now : [now + 3600],
        ...Object.fromEntries(
          Object.entries(fields).map(([key, field]) => [
            field,
            section === "current"
              ? values[section][key]
              : [values[section][key]],
          ]),
        ),
      },
    ]),
  );
};
async function login(page) {
  await page.goto("/login");
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("sofia.arias@mock.gov");
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
}
test("API real por provider, persistencia al recargar, stale y responsive", async ({
  page,
}) => {
  let requests = 0,
    offline = false;
  await page.route("https://api.open-meteo.com/**", (route) => {
    requests++;
    expect(new URL(route.request().url()).searchParams.get("latitude")).toBe(
      "9.9404316",
    );
    return offline ? route.abort() : route.fulfill({ json: payload() });
  });
  await login(page);
  let card = page.locator(".weather-card");
  await expect(card.locator(".badge[role=status]")).toHaveText("En vivo");
  await expect(
    card.getByRole("link", { name: "Datos meteorológicos: Open-Meteo" }),
  ).toBeVisible();
  const fetchedAt = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).weather.fetchedAt,
    cacheKey,
  );
  await page.reload();
  await expect(card.locator(".badge[role=status]")).toHaveText("En caché");
  expect(requests).toBe(1);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).weather.fetchedAt,
      cacheKey,
    ),
  ).toBe(fetchedAt);
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (value) =>
        document.querySelector(".theme-root").setAttribute("data-theme", value),
      theme,
    );
    for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1024 });
      await expect(card).toBeVisible();
      expect(
        await card.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
      ).toBeTruthy();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        )
        .toBeTruthy();
    }
  }
  offline = true;
  await page.evaluate((key) => {
    const entry = JSON.parse(localStorage.getItem(key));
    entry.weather.fetchedAt = new Date(Date.now() - 900001).toISOString();
    entry.expiresAt = Date.parse(entry.weather.fetchedAt) + 900000;
    localStorage.setItem(key, JSON.stringify(entry));
  }, cacheKey);
  await page.reload();
  await expect(card.locator(".badge[role=status]")).toHaveText(
    "Última información disponible",
  );
  expect(requests).toBe(2);
  await expect(
    card.getByRole("link", { name: "Datos meteorológicos: Open-Meteo" }),
  ).toBeVisible();
});
test("API caída sin clima real muestra No disponible pese a la fixture db.json", async ({
  page,
}) => {
  await page.route("https://api.open-meteo.com/**", (route) => route.abort());
  await login(page);
  const card = page.locator(".weather-card");
  await expect(card.locator(".badge[role=status]")).toHaveText("No disponible");
  await expect(card.getByRole("alert")).toHaveText(
    "Información meteorológica no disponible",
  );
  await expect(card.getByText("Simulado", { exact: true })).toHaveCount(0);
  await expect(card.getByText(/Impacto meteorológico estimado/)).toHaveCount(0);
});

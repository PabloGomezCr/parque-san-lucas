import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const artifacts = "docs/qa/screenshots";
async function login(page) {
  await page.goto("/login");
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("sofia.arias@mock.gov");
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resumen del Parque", exact: true }),
  ).toBeVisible();
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
}
test("login rechaza contraseña incorrecta, sesión y cierre confirmado", async ({
  page,
}) => {
  await page.goto("/tasks");
  await expect(page).toHaveURL(/login/);
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("sofia.arias@mock.gov");
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Credenciales incorrectas",
  );
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/tasks$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tareas del parque" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancelar", exact: true })
    .click();
  await expect(page).toHaveURL(/tasks$/);
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/login$/);
});
test("CRUD de tarea persiste, conserva formulario en error y confirma eliminación", async ({
  page,
}) => {
  await login(page);
  await page.goto("/tasks/new");
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(
    page.getByText("Revisa los campos marcados antes de guardar."),
  ).toBeVisible();
  await page
    .getByLabel("Título de la labor")
    .fill("Prueba persistencia de tarea");
  await page.getByLabel("Fecha programada").fill("2026-10-01");
  await page.getByLabel("Responsable asignado").fill("Equipo QA");
  await page
    .getByLabel("Descripción detallada")
    .fill("Registro temporal de validación");
  await page.route("**:3101/tasks", async (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 500 })
      : route.continue(),
  );
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("No se pudo guardar");
  await expect(page.getByLabel("Título de la labor")).toHaveValue(
    "Prueba persistencia de tarea",
  );
  await page.unroute("**:3101/tasks");
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Prueba persistencia de tarea",
      exact: true,
    }),
  ).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Prueba persistencia de tarea",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Editar", exact: true }).click();
  await expect(page.getByLabel("Título de la labor")).toHaveValue(
    "Prueba persistencia de tarea",
  );
  await page.getByLabel("Título de la labor").fill("Tarea actualizada QA");
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tarea actualizada QA" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Marcar como finalizada" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar cambio" })
    .click();
  await expect(
    page.locator("main > .row").getByText("Finalizada", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Eliminar registro", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancelar", exact: true })
    .click();
  await expect(page).toHaveURL(url);
  await page
    .getByRole("button", { name: "Eliminar registro", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Eliminar registro", exact: true })
    .click();
  await expect(page).toHaveURL(/tasks$/);
  await page.goto(url);
  await expect(
    page.getByText("El registro solicitado no existe."),
  ).toBeVisible();
});
test("estados lista/kanban, vacío, sin resultados, error y reintento", async ({
  page,
}) => {
  await login(page);
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Vista Kanban" }).click();
  await expect(page.getByLabel("Tablero de tareas")).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Buscar por nombre o descripción…" })
    .fill("zzz-no-existe");
  await expect(
    page.getByRole("heading", { name: "No se encontraron resultados" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.route("**:3101/tasks", (route) => route.fulfill({ json: [] }));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sin registros todavía" }),
  ).toBeVisible();
  await page.unroute("**:3101/tasks");
  await page.route("**:3101/tasks", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No fue posible cargar la información" }),
  ).toBeVisible();
  await page.unroute("**:3101/tasks");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(
    page.getByRole("heading", { name: "Tareas del parque" }),
  ).toBeVisible();
});
test("avistamiento conserva speciesId alfanumérico y persiste evidencia", async ({
  page,
}) => {
  await login(page);
  await page.goto("/species/demo-sp-1");
  await page
    .getByRole("button", { name: "Registrar avistamiento u observación" })
    .click();
  await page.getByLabel("Fecha del avistamiento").fill("2026-10-01");
  await page
    .getByLabel("Observaciones")
    .fill("Observación QA con id alfanumérico");
  await page.getByRole("button", { name: "Guardar observación" }).click();
  await expect(
    page.getByRole("cell", {
      name: "Observación QA con id alfanumérico",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("cell", {
      name: "Observación QA con id alfanumérico",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Agregar evidencia", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles({
      name: "evidencia.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jV1sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(
    page.getByRole("dialog").getByAltText("evidencia.png"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Guardar evidencia" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByAltText("evidencia.png")).toBeVisible();
  await page.reload();
  await expect(page.getByAltText("evidencia.png")).toBeVisible();
});
test("reporte filtrado descarga CSV y valida período", async ({ page }) => {
  await login(page);
  await page.goto("/reports");
  await page.getByLabel("Tipo de reporte").selectOption("tourists");
  await page.getByLabel("Desde", { exact: true }).fill("2026-10-01");
  await page.getByLabel("Hasta", { exact: true }).fill("2026-10-01");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Descargar CSV mock", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("reporte-san-lucas-mock.csv");
  await page.getByRole("button", { name: "Vista previa", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Bruno Peters");
  await page.getByRole("button", { name: "Cerrar diálogo" }).click();
  await page.getByLabel("Hasta", { exact: true }).fill("2026-09-01");
  await expect(page.getByRole("alert")).toContainText("fecha final");
});
test("pozo integra registro, histórico y detalle", async ({ page }) => {
  await login(page);
  await page.goto("/well-monitoring");
  await page
    .getByRole("button", { name: "Registrar medición manual", exact: true })
    .click();
  await page.getByLabel("Fecha de lectura").fill("2026-10-01T16:00");
  await page.getByRole("dialog").getByLabel("Nivel (m)").fill("5.8");
  await page.getByRole("dialog").getByLabel("Caudal (L/min)").fill("12");
  await page.getByRole("dialog").getByLabel("Temperatura (°C)").fill("25");
  await page.getByRole("dialog").getByLabel("pH").fill("7.2");
  await page.getByRole("button", { name: "Guardar lectura mock" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("tab", { name: "Histórico de lecturas" }).click();
  await page.getByLabel("Filtrar por fecha").fill("2026-10-01");
  await page
    .getByRole("button", { name: "Ver lectura", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("5.8 m");
});
test("perfil cambia tema, sigue sistema y conserva preferencias", async ({
  page,
}) => {
  await login(page);
  await page.goto("/profile");
  await page.getByRole("tab", { name: "Preferencias", exact: true }).click();
  await page.getByRole("button", { name: "Tema oscuro", exact: true }).click();
  await expect(page.locator(".theme-root")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.reload();
  await expect(page.locator(".theme-root")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.getByRole("tab", { name: "Preferencias", exact: true }).click();
  await page.getByRole("button", { name: "Automático", exact: true }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".theme-root")).toHaveAttribute(
    "data-theme",
    "light",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".theme-root")).toHaveAttribute(
    "data-theme",
    "dark",
  );
});
test("22 páginas, capturas desktop y responsive sin overflow ni errores JS", async ({
  page,
}) => {
  test.setTimeout(180000);
  await mkdir(artifacts, { recursive: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${artifacts}/login.png`, fullPage: true });
  await login(page);
  const routes = [
    "/dashboard",
    "/tasks",
    "/tasks/new",
    "/tasks/1",
    "/tourists",
    "/tourists/new",
    "/tourists/1",
    "/maintenance",
    "/maintenance/new",
    "/maintenance/1",
    "/heritage",
    "/heritage/new",
    "/heritage/1",
    "/species",
    "/species/new",
    "/species/1",
    "/well-monitoring",
    "/reports",
    "/profile",
    "/unauthorized",
    "/no-existe",
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await noOverflow(page);
    await page.screenshot({
      path: `${artifacts}/${route.slice(1).replaceAll("/", "-")}.png`,
      fullPage: true,
    });
  }
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/dashboard",
      "/tasks",
      "/tasks/new",
      "/tourists",
      "/maintenance",
      "/heritage",
      "/species",
      "/well-monitoring",
      "/reports",
      "/profile",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading").first()).toBeVisible();
      await noOverflow(page);
    }
    await page.screenshot({
      path: `${artifacts}/profile-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Mantenimiento", exact: true })
    .click();
  await expect(page).toHaveURL(/maintenance$/);
});

test("branding global, contraste AA y geometría estable en claro/oscuro", async ({
  page,
}) => {
  test.setTimeout(120000);
  await mkdir(artifacts, { recursive: true });
  await login(page);
  const routes = [
    "/dashboard",
    "/tasks",
    "/tourists",
    "/maintenance",
    "/heritage",
    "/species",
    "/well-monitoring",
    "/reports",
    "/profile",
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.locator(".sidebar .brand-logo__symbol")).toHaveAttribute(
      "src",
      "/assets/branding/pelicano-logo-san-lucas.png",
    );
    await expect(page.locator(".sidebar .brand-logo")).toBeVisible();
    const geometry = () =>
      page
        .locator(".page-header,.metric-grid,.sidebar")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
    const before = await geometry();
    await page
      .getByRole("button", { name: "Cambiar tema", exact: true })
      .click();
    await expect(page.locator(".theme-root")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(page.locator(".sidebar .brand-logo__symbol")).toHaveAttribute(
      "src",
      "/assets/branding/pelicano-logo-san-lucas.png",
    );
    expect(await geometry()).toEqual(before);
    await noOverflow(page);
    await page.screenshot({
      path: `${artifacts}/${route.slice(1)}-dark.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Cambiar tema", exact: true })
      .click();
  }
  const measured = [];
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page
        .getByRole("button", { name: "Cambiar tema", exact: true })
        .click();
    const tokens = await page.locator(".theme-root").evaluate((el) => {
      const styles = getComputedStyle(el);
      return Object.fromEntries(
        [
          "--text-primary",
          "--text-secondary",
          "--text-muted",
          "--surface",
          "--surface-subtle",
          "--surface-elevated",
          "--background",
          "--brand-primary",
          "--brand-primary-hover",
          "--brand-primary-active",
          "--text-on-brand",
          "--color-success",
          "--success-bg",
          "--color-error",
          "--error-bg",
          "--color-warning",
          "--warning-bg",
          "--color-info",
          "--info-bg",
          "--module-heritage",
          "--module-heritage-subtle",
          "--module-technology",
          "--module-technology-subtle",
        ].map((name) => [name, styles.getPropertyValue(name).trim()]),
      );
    });
    const luminance = (hex) => {
      const rgb = hex
        .slice(1)
        .match(/.{2}/g)
        .slice(0, 3)
        .map((n) => parseInt(n, 16) / 255)
        .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const pairs = [];
    for (const fg of ["--text-primary", "--text-secondary", "--text-muted"])
      for (const bg of [
        "--surface",
        "--surface-subtle",
        "--surface-elevated",
        "--background",
      ])
        pairs.push([fg, bg]);
    for (const bg of [
      "--brand-primary",
      "--brand-primary-hover",
      "--brand-primary-active",
    ])
      pairs.push(["--text-on-brand", bg]);
    for (const name of ["success", "error", "warning", "info"])
      pairs.push([`--color-${name}`, `--${name}-bg`]);
    for (const name of ["heritage", "technology"])
      pairs.push([`--module-${name}`, `--module-${name}-subtle`]);
    for (const [fg, bg] of pairs) {
      const values = [luminance(tokens[fg]), luminance(tokens[bg])].sort(
        (a, b) => a - b,
      );
      const ratio = (values[1] + 0.05) / (values[0] + 0.05);
      measured.push({
        theme,
        foreground: fg,
        background: bg,
        ratio: Math.round(ratio * 100) / 100,
      });
      expect(ratio, `${theme}: ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  }
  const { writeFile } = await import("node:fs/promises");
  await writeFile(
    "docs/qa/contrast.json",
    JSON.stringify(measured, null, 2) + "\n",
  );
  for (const route of ["/unauthorized", "/no-existe"]) {
    await page.goto(route);
    await expect(page.locator(".brand-logo")).toBeVisible();
    await noOverflow(page);
  }
  await page.goto("/profile");
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.locator(".topbar .brand-logo")).toBeVisible();
  await expect(page.locator(".topbar .brand-logo__symbol")).toBeVisible();
  const overlaps = await page.locator(".topbar").evaluate((bar) => {
    const brand = bar.querySelector(".topbar__brand").getBoundingClientRect();
    const actions = bar
      .querySelector(".topbar-actions")
      .getBoundingClientRect();
    return brand.right > actions.left;
  });
  expect(overlaps).toBe(false);
  await page.screenshot({
    path: `${artifacts}/mobile-brand-dark.png`,
    fullPage: true,
  });
});

test("logo de ingreso: carga real, reposo, reduced motion y tamaños", async ({
  page,
}) => {
  await page.goto("/login");
  const symbol = page.locator(".login-brand .brand-logo__symbol");
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    const mark = await page
      .locator(".login-brand .brand-logo__mark")
      .boundingBox();
    expect(mark.width).toBe(width <= 480 ? 88 : width <= 1024 ? 104 : 120);
    expect(mark.height).toBe(mark.width);
  }
  await expect(symbol).toHaveCSS("animation-name", "none");
  let release;
  await page.route("**/users", async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: [] });
  });
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("invalid@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("wrong");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ingresando al sistema..." }),
  ).toBeDisabled();
  await expect(page.locator(".brand-logo__wing-left")).toHaveCSS(
    "animation-name",
    "pelican-wing-left",
  );
  await expect(page.locator(".brand-logo__wing-right")).toHaveCSS(
    "animation-duration",
    "1.1s",
  );
  await expect(page.locator(".brand-logo__body")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.screenshot({
    path: `${artifacts}/login-loading.png`,
    fullPage: true,
  });
  release();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator(".brand-logo__wing-left")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(symbol).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ingresando al sistema..." }),
  ).toBeDisabled();
  await expect(symbol).toHaveCSS("animation-name", "none");
  await expect(page.locator(".brand-logo__wing-left")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(symbol).toHaveCSS("opacity", "1");
  await expect(symbol).toHaveAttribute(
    "src",
    "/assets/branding/pelicano-logo-san-lucas.png",
  );
  release();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.screenshot({
    path: `${artifacts}/login-dark-static.png`,
    fullPage: true,
  });
});

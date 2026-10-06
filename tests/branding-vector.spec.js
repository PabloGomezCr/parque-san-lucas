import { test, expect } from "@playwright/test";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test("vectorización: silueta del PNG maestro y grupos separados", async ({
  page,
}) => {
  const master = await readFile(
    "public/assets/branding/pelicano-logo-san-lucas.png",
  );
  expect(createHash("sha256").update(master).digest("hex")).toBe(
    "c91087b33371c578d6fdd1f7dad722843b94211bf22d4b6f33de06f5889c8912",
  );
  await page.goto("/login");
  const result = await page.evaluate(async () => {
    const load = async (path) => {
      const img = new Image();
      img.src = path;
      await img.decode();
      return img;
    };
    const [png, svg] = await Promise.all([
      load("/assets/branding/pelicano-logo-san-lucas.png"),
      load("/assets/branding/pelicano-logo-san-lucas.svg"),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = 1254;
    canvas.height = 1254;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(png, 0, 0);
    const original = ctx.getImageData(0, 0, 1254, 1254);
    ctx.clearRect(0, 0, 1254, 1254);
    ctx.drawImage(svg, 0, 0);
    const vector = ctx.getImageData(0, 0, 1254, 1254);
    const preview = canvas.toDataURL();
    const diff = ctx.createImageData(1254, 1254);
    let union = 0,
      intersection = 0,
      disagreement = 0,
      sourcePixels = 0;
    for (let i = 0; i < original.data.length; i += 4) {
      const a = original.data[i + 2] > 140,
        b = vector.data[i + 2] > 140;
      if (a) sourcePixels++;
      if (a || b) union++;
      if (a && b) intersection++;
      if (a !== b) disagreement++;
      diff.data[i] = a && !b ? 255 : a && b ? 220 : 17;
      diff.data[i + 1] = b && !a ? 255 : a && b ? 220 : 23;
      diff.data[i + 2] = a && b ? 220 : 41;
      diff.data[i + 3] = 255;
    }
    ctx.putImageData(diff, 0, 0);
    return {
      iou: intersection / union,
      disagreement,
      sourcePixels,
      preview,
      diff: canvas.toDataURL(),
    };
  });
  await mkdir("docs/qa/branding", { recursive: true });
  for (const name of ["preview", "diff"])
    await writeFile(
      `docs/qa/branding/${name}.png`,
      Buffer.from(result[name].split(",")[1], "base64"),
    );
  await writeFile(
    "docs/qa/branding/fidelity.json",
    JSON.stringify(
      {
        sourceSHA256: createHash("sha256").update(master).digest("hex"),
        intersectionOverUnion: result.iou,
        disagreementPixels: result.disagreement,
        sourceForegroundPixels: result.sourcePixels,
        method:
          "Blue > 140 silhouette comparison at native 1254×1254. Raster antialiasing and segmentation boundaries may differ.",
      },
      null,
      2,
    ),
  );
  expect(result.iou).toBeGreaterThan(0.99);
  const vector = page.locator(".brand-logo__vector");
  for (const name of ["wing-left", "body", "wing-right"])
    await expect(vector.locator(`[data-part="${name}"] path`)).toHaveCount(1);
});

test("reduced motion durante carga no reanuda las alas al terminar", async ({
  page,
}) => {
  await page.goto("/login");
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
  ).toHaveAttribute("aria-busy", "true");
  const wing = page.locator(".brand-logo__wing-left");
  await expect(wing).toHaveCSS("animation-name", "pelican-wing-left");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(wing).toHaveCSS("animation-name", "none");
  await expect(page.locator(".brand-logo__symbol")).toHaveCSS("opacity", "1");
  release();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(wing).toHaveCSS("animation-name", "none");
  await expect(page.locator(".brand-logo__symbol")).toHaveCSS("opacity", "1");
});

for (const reducedAtCompletion of [false, true]) {
  test(`ingreso exitoso respeta cierre del aleteo (reduced=${reducedAtCompletion})`, async ({
    page,
  }) => {
    await page.goto("/login");
    let release;
    await page.route("**/users", async (route) => {
      const response = await route.fetch();
      await new Promise((resolve) => {
        release = resolve;
      });
      await route.fulfill({ response });
    });
    await page
      .getByLabel("Correo o usuario", { exact: true })
      .fill("sofia.arias@mock.gov");
    await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(page.locator(".brand-logo__wing-left")).toHaveCSS(
      "animation-name",
      "pelican-wing-left",
    );
    await expect(page.locator(".brand-logo")).toHaveAttribute(
      "data-motion",
      "active",
    );
    await expect.poll(() => Boolean(release)).toBe(true);
    await page.locator(".brand-logo").evaluate((el) => {
      for (const animation of el.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = 550;
      }
    });
    release();
    await expect(
      page.getByRole("button", { name: "Acceso verificado" }),
    ).toBeDisabled();
    await expect(page).toHaveURL(/\/login$/);
    if (reducedAtCompletion) {
      await page.emulateMedia({ reducedMotion: "reduce" });
    } else {
      await page.locator(".brand-logo").evaluate((el) => {
        for (const animation of el.getAnimations({ subtree: true }))
          animation.play();
      });
    }
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Resumen del Parque", exact: true }),
    ).toBeVisible();
  });
}

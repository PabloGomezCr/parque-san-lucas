import { test, expect } from "@playwright/test";
async function login(page, email) {
  await page.goto("/login");
  await page.getByLabel("Correo o usuario", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resumen del Parque" }),
  ).toBeVisible();
}
test("chat compartido en móvil y escritorio conserva remitente, lectura y navegación", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "guardaparque@mock.gov");
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  const drawer = page.getByRole("dialog", { name: "Módulos del parque" });
  await drawer.getByRole("link", { name: "Chat", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chat del parque" }),
  ).toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Directo administrativo" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Mensaje móvil " + "x".repeat(300));
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Mensaje móvil");
  await expect(page.getByRole("log")).toContainText("Guardaparque de Prueba");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => localStorage.clear());
  await page.setViewportSize({ width: 1280, height: 1024 });
  await login(page, "master.admin@mock.gov");
  await page
    .getByRole("complementary", { name: "Navegación principal" })
    .getByRole("link", { name: "Chat", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Guardaparque de Prueba");
  await page.getByRole("tab", { name: "Directo administrativo" }).click();
  await page
    .getByLabel("Destinatario", { exact: true })
    .selectOption("admin-1");
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Directo compartido QA");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Directo compartido QA");
  await page.evaluate(() => localStorage.clear());
  await login(page, "admin@mock.gov");
  await page.goto("/chat");
  await page.getByRole("tab", { name: "Directo administrativo" }).click();
  await expect(page.getByLabel("1 mensajes sin leer")).toBeVisible();
  await page
    .getByLabel("Destinatario", { exact: true })
    .selectOption("master-1");
  await expect(page.getByRole("log")).toContainText("Directo compartido QA");
  await expect(page.getByLabel("1 mensajes sin leer")).toHaveCount(0);
});

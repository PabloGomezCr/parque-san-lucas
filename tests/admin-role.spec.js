import { test, expect } from "@playwright/test";

async function login(page, email) {
  await page.goto("/login");
  await page.getByLabel("Correo o usuario", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resumen del Parque", exact: true }),
  ).toBeVisible();
}
async function changeSession(page, email) {
  await page.evaluate(() => localStorage.clear());
  await login(page, email);
}

test("ADMIN usa su base y solo delega/exporta/gestiona usuarios cuando el Maestro concede permisos", async ({
  page,
}) => {
  await login(page, "admin@mock.gov");
  const nav = page.getByRole("complementary", { name: "Navegación principal" });
  await expect(
    nav.getByRole("link", { name: "Chat", exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Usuarios", exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole("link", { name: "Pozo de Agua", exact: true }),
  ).toHaveCount(0);
  await page.goto("/tasks/1");
  await expect(
    page.getByRole("heading", { name: "Inspección de sendero norte" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delegar registro", exact: true }),
  ).toHaveCount(0);
  await page.goto("/reports");
  await expect(
    page.getByRole("heading", { name: "Centro de Reportes Consolidados" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Descargar CSV mock", exact: true }),
  ).toHaveCount(0);
  await page.goto("/users");
  await expect(
    page.getByRole("heading", { name: "Acceso restringido" }),
  ).toBeVisible();
  await page.goto("/chat");
  await expect(
    page.getByRole("tab", { name: "Chat grupal", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Directo administrativo", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Mensaje de ADMIN QA");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Mensaje de ADMIN QA");

  // Dedicated records keep this E2E independent of the existing master/legacy tests.
  await page.goto("/tasks/new");
  await page.getByLabel("Título de la labor").fill("Tarea ADMIN QA");
  await page.getByLabel("Fecha programada").fill("2026-10-05");
  await page
    .getByLabel("Responsable asignado")
    .fill("Administrador de Operaciones Mock");
  await page
    .getByLabel("Descripción detallada de la labor")
    .fill("Registro ficticio de prueba");
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tarea ADMIN QA", exact: true }),
  ).toBeVisible();
  const taskPath = new URL(page.url()).pathname;
  await page.goto("/maintenance/new");
  await page
    .getByLabel("Título del mantenimiento")
    .fill("Mantenimiento ADMIN QA");
  await page.getByLabel("Fecha programada").fill("2026-10-05");
  await page
    .getByLabel("Técnico responsable")
    .fill("Administrador de Operaciones Mock");
  await page.getByLabel("Área afectada").fill("Área ficticia");
  await page
    .getByRole("button", { name: "Guardar mantenimiento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mantenimiento ADMIN QA", exact: true }),
  ).toBeVisible();
  const maintenancePath = new URL(page.url()).pathname;

  await changeSession(page, "master.admin@mock.gov");
  await page.goto("/users");
  const permissions = page.getByRole("form", {
    name: "Permisos de Administrador de Operaciones Mock",
    exact: true,
  });
  for (const label of [
    "Delegar tareas",
    "Delegar mantenimiento",
    "Exportar reportes",
    "Consultar usuarios",
    "Editar usuarios",
  ])
    await permissions
      .getByRole("checkbox", { name: label, exact: true })
      .check();
  await permissions
    .getByRole("button", { name: "Guardar permisos", exact: true })
    .click();
  await expect(
    permissions.getByRole("button", { name: "Guardar permisos", exact: true }),
  ).toBeDisabled();

  await changeSession(page, "admin@mock.gov");
  await expect(
    nav.getByRole("link", { name: "Usuarios", exact: true }),
  ).toBeVisible();
  for (const path of [taskPath, maintenancePath]) {
    await page.goto(path);
    await page.getByLabel("Usuario responsable").selectOption("1");
    await page
      .getByRole("button", { name: "Delegar registro", exact: true })
      .click();
    await expect(
      page.getByText(/Delegado por: Administrador de Operaciones Mock/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reasignar responsable", exact: true }),
    ).toHaveCount(0);
  }
  await page.goto("/reports");
  await expect(
    page.getByRole("link", { name: "Descargar CSV mock", exact: true }),
  ).toBeVisible();
  await page.goto("/users");
  await expect(
    page.getByRole("heading", { name: "Usuarios del parque" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Asignar rol", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Guardar permisos", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Crear usuario", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Editar usuario Administrador de Operaciones Mock",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar usuario", exact: true }),
  ).toBeVisible();
});

import { test, expect } from "@playwright/test";
test("Guardaparque registra operaciones, atiende incidencia y usa chat sin privilegios administrativos", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("guardaparque@mock.gov");
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resumen del Parque" }),
  ).toBeVisible();
  await page.goto("/tasks/new");
  await page.getByLabel("Título de la labor").fill("Tarea Guardaparque QA");
  await page.getByLabel("Fecha programada").fill("2026-10-05");
  await page.getByLabel("Responsable asignado").fill("Guardaparque de Prueba");
  await page
    .getByLabel("Descripción detallada de la labor")
    .fill("Operación ficticia");
  await page
    .getByRole("button", { name: "Guardar tarea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tarea Guardaparque QA", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delegar registro", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Marcar como finalizada", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar cambio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Marcar como finalizada", exact: true }),
  ).toHaveCount(0);
  await page.goto("/species/new");
  await page.getByLabel("Nombre común").fill("Especie ficticia QA");
  await page.getByLabel("Nombre científico").fill("Species ficticia");
  await page.getByLabel("Fecha de registro").fill("2026-10-05");
  await page
    .getByRole("button", { name: "Guardar especie", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Especie ficticia QA", exact: true }),
  ).toBeVisible();
  await page.goto("/heritage/new");
  await expect(
    page.getByText(/Registrar una intervención no significa autorizarla/),
  ).toBeVisible();
  await page.getByLabel("Elemento patrimonial").fill("Patrimonio ficticio QA");
  await page.getByLabel("Fecha de intervención").fill("2026-10-05");
  await page
    .getByLabel("Responsable de la intervención")
    .fill("Guardaparque de Prueba");
  await page
    .getByLabel("Descripción del diagnóstico físico")
    .fill("Diagnóstico ficticio");
  await page
    .getByRole("button", { name: "Guardar intervención", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Patrimonio ficticio QA", exact: true }),
  ).toBeVisible();
  await page.goto("/incidents");
  await page
    .getByRole("button", {
      name: "Señal de sendero dañada · prueba",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Marcar revisada", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Convertir en mantenimiento", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Abrir registro vinculado", exact: true })
    .click();
  await expect(
    page.getByText("Un guía reporta una señal dañada en un sector ficticio."),
  ).toBeVisible();
  await page.goto("/users");
  await expect(
    page.getByRole("heading", { name: "Acceso restringido" }),
  ).toBeVisible();
  await page.goto("/chat");
  await expect(
    page.getByRole("tab", { name: "Directo administrativo", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Mensaje Guardaparque QA");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Mensaje Guardaparque QA");
});

import { test, expect } from "@playwright/test";

test("MASTER_ADMIN administra su parque, delega con historial y participa en ambos chats", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo o usuario", { exact: true })
    .fill("master.admin@mock.gov");
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.getByText("Asignadas a mí", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Delegadas por mí", { exact: true }),
  ).toBeVisible();
  const sidebar = page.getByRole("complementary", {
    name: "Navegación principal",
  });
  await expect(
    sidebar.getByRole("link", { name: "Usuarios", exact: true }),
  ).toBeVisible();
  await expect(
    sidebar.getByRole("link", { name: "Chat", exact: true }),
  ).toBeVisible();
  for (const path of ["/tasks/1", "/maintenance/1"]) {
    await page.goto(path);
    await page.getByLabel("Usuario responsable").selectOption("1");
    await page
      .getByRole("button", { name: "Delegar registro", exact: true })
      .click();
    await expect(
      page.getByRole("table", { name: "Historial de delegación" }),
    ).toContainText("Administrador de Prueba");
    await page.getByLabel("Usuario responsable").selectOption("master-1");
    await page
      .getByRole("button", { name: "Reasignar responsable", exact: true })
      .click();
    await expect(
      page
        .getByRole("table", { name: "Historial de delegación" })
        .getByRole("row"),
    ).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: "Eliminar registro", exact: true }),
    ).toHaveCount(0);
  }
  await page.goto("/users");
  await page
    .getByRole("button", { name: "Crear usuario", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre completo").fill("Usuario QA Maestro");
  await dialog
    .getByRole("textbox", { name: "Correo", exact: true })
    .fill("maestro-qa@example.test");
  await dialog.getByLabel("Contraseña de demostración").fill("clave-ficticia");
  await dialog
    .getByRole("button", { name: "Guardar usuario", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Editar usuario Usuario QA Maestro" }),
  ).toBeVisible();
  const row = page
    .getByRole("row")
    .filter({ hasText: "maestro-qa@example.test" });
  await row
    .getByLabel("Rol de Usuario QA Maestro")
    .selectOption("MASTER_ADMIN");
  await row.getByRole("button", { name: "Asignar rol", exact: true }).click();
  await expect(
    row.getByRole("cell", { name: "Administrador Maestro", exact: true }),
  ).toBeVisible();
  await page.goto("/chat");
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Mensaje grupal QA");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Mensaje grupal QA");
  await page
    .getByRole("tab", { name: "Directo administrativo", exact: true })
    .click();
  await page.getByLabel("Destinatario", { exact: true }).selectOption("1");
  await page
    .getByRole("textbox", { name: "Mensaje", exact: true })
    .fill("Mensaje directo QA");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Mensaje directo QA");
  await expect(page.getByRole("log")).not.toContainText("Mensaje grupal QA");
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Chat grupal", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("log")).toContainText("Mensaje grupal QA");
});

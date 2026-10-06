import React from "react";
import { beforeEach, describe, it, expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { modules } from "../config/modules";
import { speciesService } from "../services/speciesService";
import { renderWithProviders } from "./renderWithProviders";
import { recordFixture } from "./fixtures/records";
import { deferred } from "./mocks/deferred";

// Shared behavioral contracts for Pages that use the same CRUD architecture.
export function recordPageSuite(Page, key, kind) {
  const config = modules[key];
  let record;
  const mount = (mode = kind) =>
    renderWithProviders(<Page />, {
      route:
        mode === "list"
          ? config.path
          : mode === "create"
            ? `${config.path}/new`
            : `${config.path}/mock-1${mode === "edit" ? "/edit" : ""}`,
      path:
        mode === "list"
          ? config.path
          : mode === "create"
            ? `${config.path}/new`
            : `${config.path}/:id${mode === "edit" ? "/edit" : ""}`,
    });
  const save = () =>
    screen.getByRole("button", { name: `Guardar ${config.singular}` });
  async function fillRequired(user) {
    for (const field of config.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.required)) {
      const input = screen.getByLabelText(new RegExp(field.label));
      await user.clear(input);
      await user.type(input, String(record[field.name]));
    }
  }
  describe(Page.name, () => {
    beforeEach(() => {
      record = recordFixture(key);
      config.getAll.mockResolvedValue([record]);
      config.getById.mockResolvedValue(record);
      config.create.mockResolvedValue(record);
      config.update.mockResolvedValue(record);
      config.remove.mockResolvedValue(undefined);
      speciesService.getObservations.mockResolvedValue([]);
    });
    if (kind === "list") {
      it("muestra carga mientras consulta el servicio", () => {
        config.getAll.mockReturnValue(new Promise(() => {}));
        mount();
        expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
      });
      it("muestra error y permite reintentar", async () => {
        config.getAll.mockRejectedValueOnce(
          new Error("Servicio no disponible"),
        );
        const { user } = mount();
        expect(await screen.findByText("Servicio no disponible")).toBeVisible();
        await user.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(
          await screen.findByRole("heading", { name: config.title }),
        ).toBeVisible();
      });
      it("distingue una colección vacía", async () => {
        config.getAll.mockResolvedValue([]);
        mount();
        expect(
          await screen.findByRole("heading", { name: "Sin registros todavía" }),
        ).toBeVisible();
      });
      it("renderiza registros y navega a crear", async () => {
        const { user } = mount();
        await screen.findByRole("heading", { name: config.title });
        expect(
          screen.getAllByText(record[config.titleKey]).length,
        ).toBeGreaterThan(0);
        await user.click(
          screen.getByRole("link", { name: config.createTitle }),
        );
        expect(
          await screen.findByText(`Destino: ${config.path}/new`),
        ).toBeVisible();
      });
      it("navega al detalle del registro", async () => {
        const { user } = mount();
        await screen.findByRole("heading", { name: config.title });
        const links = screen
          .getAllByRole("link")
          .filter((a) => a.getAttribute("href") === `${config.path}/mock-1`);
        await user.click(links[0]);
        expect(
          await screen.findByText(`Destino: ${config.path}/mock-1`),
        ).toBeVisible();
      });
      it("busca y distingue resultados inexistentes", async () => {
        const { user } = mount();
        await screen.findByRole("heading", { name: config.title });
        const search = screen.getByPlaceholderText(/Buscar por/);
        await user.type(search, "inexistente");
        expect(
          screen.getByRole("heading", { name: "No se encontraron resultados" }),
        ).toBeVisible();
        await user.clear(search);
        await user.type(search, "ficticio");
        expect(
          screen.queryByRole("heading", {
            name: "No se encontraron resultados",
          }),
        ).not.toBeInTheDocument();
      });
      it("combina búsqueda con filtro de estado y categoría", async () => {
        const { user } = mount();
        await screen.findByRole("heading", { name: config.title });
        await user.type(screen.getByPlaceholderText(/Buscar por/), "ficticio");
        await user.selectOptions(
          screen.getByLabelText("Filtrar por categoría"),
          record[config.categoryKey],
        );
        await user.selectOptions(
          screen.getByLabelText("Filtrar por estado"),
          config.states.find((s) => s !== record.status),
        );
        expect(
          screen.getByRole("heading", { name: "No se encontraron resultados" }),
        ).toBeVisible();
        await user.selectOptions(
          screen.getByLabelText("Filtrar por estado"),
          record.status,
        );
        expect(
          screen.getAllByText(record[config.titleKey]).length,
        ).toBeGreaterThan(0);
      });
      if (key === "tasks")
        it("cambia a Kanban y conserva las tareas", async () => {
          const { user } = mount();
          await screen.findByRole("heading", { name: config.title });
          await user.click(
            screen.getByRole("button", { name: "Vista Kanban" }),
          );
          expect(
            screen.getByRole("button", { name: "Vista Kanban" }),
          ).toHaveAttribute("aria-pressed", "true");
          expect(screen.getByText(record.title)).toBeVisible();
        });
    } else if (kind === "form") {
      it("muestra create y valida campos obligatorios antes de enviar", async () => {
        const { user } = mount("create");
        await screen.findByRole("heading", { name: config.createTitle });
        await user.click(save());
        expect(
          screen
            .getAllByRole("alert")
            .some((alert) => alert.textContent.includes("Revisa los campos")),
        ).toBe(true);
        expect(config.create).not.toHaveBeenCalled();
      });
      it("crea el registro y navega al detalle", async () => {
        const { user } = mount("create");
        await screen.findByRole("heading", { name: config.createTitle });
        await fillRequired(user);
        await user.click(save());
        expect(
          await screen.findByText(`Destino: ${config.path}/mock-1`),
        ).toBeVisible();
        expect(config.create).toHaveBeenCalledWith(
          expect.objectContaining({
            [config.titleKey]: record[config.titleKey],
            mock: true,
          }),
        );
      });
      it("carga por id, muestra valores iniciales y guarda edit", async () => {
        const { user } = mount("edit");
        await screen.findByRole("heading", { name: config.editTitle });
        expect(config.getById).toHaveBeenCalledWith("mock-1");
        const field = config.sections
          .flatMap((s) => s.fields)
          .find((f) => f.name === config.titleKey);
        expect(screen.getByLabelText(new RegExp(field.label))).toHaveValue(
          record[config.titleKey],
        );
        await user.type(
          screen.getByLabelText(new RegExp(field.label)),
          " editado",
        );
        await user.click(save());
        expect(
          await screen.findByText(`Destino: ${config.path}/mock-1`),
        ).toBeVisible();
        expect(config.update).toHaveBeenCalledWith(
          "mock-1",
          expect.objectContaining({
            [config.titleKey]: record[config.titleKey] + " editado",
          }),
        );
        expect(config.create).not.toHaveBeenCalled();
      });
      it("muestra carga y error de consulta en edit", async () => {
        config.getById.mockRejectedValue(new Error("Registro no encontrado"));
        mount("edit");
        expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
        expect(await screen.findByText("Registro no encontrado")).toBeVisible();
      });
      it("bloquea guardado pendiente y muestra error sin perder datos", async () => {
        const pending = deferred();
        config.update.mockReturnValue(pending.promise);
        const { user } = mount("edit");
        await screen.findByRole("heading", { name: config.editTitle });
        await user.click(save());
        expect(
          screen.getByRole("button", { name: "Guardando…" }),
        ).toBeDisabled();
        pending.reject(new Error("No se pudo guardar"));
        expect(await screen.findByRole("alert")).toHaveTextContent(
          "No se pudo guardar",
        );
        expect(save()).toBeEnabled();
      });
      it("confirma descarte de cambios y permite cancelar el diálogo", async () => {
        const { user } = mount("create");
        await screen.findByRole("heading", { name: config.createTitle });
        await fillRequired(user);
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        let dialog = screen.getByRole("dialog");
        await user.click(
          within(dialog).getByRole("button", { name: "Cancelar" }),
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        dialog = screen.getByRole("dialog");
        await user.click(
          within(dialog).getByRole("button", { name: "Descartar cambios" }),
        );
        expect(
          await screen.findByText(`Destino: ${config.path}`),
        ).toBeVisible();
      });
    } else {
      it("muestra carga y datos consultados por id", async () => {
        mount();
        expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
        expect(
          await screen.findByRole("heading", { name: record[config.titleKey] }),
        ).toBeVisible();
        expect(config.getById).toHaveBeenCalledWith("mock-1");
      });
      it("maneja error de consulta", async () => {
        config.getById.mockRejectedValue(new Error("Error de consulta"));
        mount();
        expect(await screen.findByText("Error de consulta")).toBeVisible();
      });
      it("maneja registro inexistente", async () => {
        config.getById.mockResolvedValue(null);
        mount();
        expect(
          await screen.findByText("El registro solicitado no existe."),
        ).toBeVisible();
      });
      it.each(["Editar", "Volver"])("navega mediante %s", async (name) => {
        const { user } = mount();
        await screen.findByRole("heading", { name: record[config.titleKey] });
        await user.click(screen.getByRole("link", { name }));
        expect(
          await screen.findByText(
            `Destino: ${config.path}${name === "Editar" ? "/mock-1/edit" : ""}`,
          ),
        ).toBeVisible();
      });
      it("cancela cambio de estado sin modificar el servicio y luego confirma", async () => {
        const target = config.states.find((s) => s !== record.status);
        const { user } = mount();
        await screen.findByRole("heading", { name: record[config.titleKey] });
        await user.selectOptions(
          screen.getByLabelText("Cambiar estado"),
          target,
        );
        await user.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "Cancelar",
          }),
        );
        expect(config.update).not.toHaveBeenCalled();
        config.getById.mockResolvedValue({ ...record, status: target });
        await user.selectOptions(
          screen.getByLabelText("Cambiar estado"),
          target,
        );
        await user.click(
          screen.getByRole("button", { name: "Confirmar cambio" }),
        );
        await waitFor(() =>
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
        expect(config.update).toHaveBeenCalledWith(
          "mock-1",
          expect.objectContaining({ status: target }),
        );
        expect(screen.getByLabelText("Cambiar estado")).toHaveValue(target);
      });
      it("muestra error de acción y permite cancelar", async () => {
        config.remove.mockRejectedValue(new Error("No se pudo eliminar"));
        const { user } = mount();
        await screen.findByRole("heading", { name: record[config.titleKey] });
        await user.click(
          screen.getByRole("button", { name: "Eliminar registro" }),
        );
        await user.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "Eliminar registro",
          }),
        );
        expect(await screen.findByRole("alert")).toHaveTextContent(
          "No se pudo eliminar",
        );
        await user.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "Cancelar",
          }),
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      if (config.states.includes("completed"))
        it("finaliza desde la acción principal con confirmación", async () => {
          const { user } = mount();
          await screen.findByRole("heading", { name: record[config.titleKey] });
          await user.click(
            screen.getByRole("button", { name: "Marcar como finalizada" }),
          );
          config.getById.mockResolvedValue({ ...record, status: "completed" });
          await user.click(
            screen.getByRole("button", { name: "Confirmar cambio" }),
          );
          await waitFor(() =>
            expect(screen.getByLabelText("Cambiar estado")).toHaveValue(
              "completed",
            ),
          );
          expect(
            screen.queryByRole("button", { name: "Marcar como finalizada" }),
          ).not.toBeInTheDocument();
        });
      if (key !== "tourists")
        it("muestra ausencia de evidencia y abre y cierra su formulario", async () => {
          const { user } = mount();
          await screen.findByRole("heading", { name: record[config.titleKey] });
          expect(screen.getByText("No hay evidencias adjuntas.")).toBeVisible();
          await user.click(
            screen.getByRole("button", { name: "Agregar evidencia" }),
          );
          expect(screen.getByRole("dialog")).toBeVisible();
          await user.click(
            screen.getByRole("button", { name: "Cerrar diálogo" }),
          );
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
      it("elimina con confirmación y vuelve al listado", async () => {
        const { user } = mount();
        await screen.findByRole("heading", { name: record[config.titleKey] });
        await user.click(
          screen.getByRole("button", { name: "Eliminar registro" }),
        );
        await user.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "Eliminar registro",
          }),
        );
        expect(
          await screen.findByText(`Destino: ${config.path}`),
        ).toBeVisible();
        expect(config.remove).toHaveBeenCalledWith("mock-1");
      });
    }
  });
}

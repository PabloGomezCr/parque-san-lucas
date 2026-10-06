import React from "react";
import { beforeEach, it, expect, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
vi.mock("../../services/apiClient", () => ({ apiClient: vi.fn() }));
import { apiClient } from "../../services/apiClient";
import { ChatPanel } from "./ChatPanel";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockJsonServer } from "../../test/mocks/jsonServer";
import {
  masterActor,
  adminActor,
  rangerActor,
  inactiveWorker,
  foreignWorker,
} from "../../test/fixtures/admin";
import { messageFactory } from "../../test/fixtures/chat";
let db;
beforeEach(() => {
  db = mockJsonServer({
    users: [
      masterActor,
      adminActor,
      rangerActor,
      inactiveWorker,
      foreignWorker,
    ],
    chatMessages: [
      messageFactory({
        senderUserId: adminActor.id,
        senderName: "Nombre falso",
        senderRole: "Rol falso",
        text: "Informe del campo",
      }),
    ],
  });
});
const mount = (actor) =>
  renderWithProviders(<ChatPanel />, { auth: { user: actor || masterActor } });
it("muestra remitente resuelto y marca leído lo presentado", async () => {
  mount();
  const log = await screen.findByRole("log");
  expect(await within(log).findByText(adminActor.name)).toBeVisible();
  expect(within(log).getByText("· Administrador")).toBeVisible();
  expect(screen.queryByText("Nombre falso")).not.toBeInTheDocument();
  await waitFor(() =>
    expect(db.chatChannelMembers[0].lastReadMessageId).toBe("message-1"),
  );
  expect(
    within(
      await screen.findByRole("complementary", {
        name: "Conversaciones del parque",
      }),
    ).getByText("Parque Nacional Isla San Lucas"),
  ).toBeVisible();
});
it("muestra no leídos de directos, filtra contactos y permite seleccionar y responder", async () => {
  db.directConversations.push({
    id: "direct-1",
    parkId: "1",
    userIds: [masterActor.id, adminActor.id],
    lastReadByUser: {},
  });
  db.chatMessages.push(
    messageFactory({
      id: "direct-message",
      kind: "direct",
      channelId: null,
      conversationId: "direct-1",
      senderUserId: adminActor.id,
      text: "Coordinación",
    }),
  );
  const { user } = mount();
  await user.click(screen.getByRole("tab", { name: "Directo administrativo" }));
  const selector = await screen.findByLabelText("Destinatario");
  expect(
    within(selector).queryByRole("option", { name: inactiveWorker.name }),
  ).not.toBeInTheDocument();
  expect(
    within(selector).queryByRole("option", { name: foreignWorker.name }),
  ).not.toBeInTheDocument();
  expect(await screen.findByLabelText("1 mensajes sin leer")).toBeVisible();
  await user.selectOptions(selector, adminActor.id);
  expect(await screen.findByText("Coordinación")).toBeVisible();
  await waitFor(() =>
    expect(db.directConversations[0].lastReadByUser[masterActor.id]).toBe(
      "direct-message",
    ),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Mensaje" }),
    "Respuesta",
  );
  await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
  expect(await screen.findByText("Respuesta")).toBeVisible();
  expect(db.chatMessages.at(-1)).not.toHaveProperty("senderName");
});
it("no consulta conversaciones directas para usuario solo grupal y navega tabs con teclado", async () => {
  const { user, unmount } = mount(rangerActor);
  await screen.findByRole("log");
  expect(
    screen.queryByRole("tab", { name: "Directo administrativo" }),
  ).not.toBeInTheDocument();
  expect(
    apiClient.mock.calls.some(([path]) => path === "/directConversations"),
  ).toBe(false);
  unmount();
  mount();
  const group = screen.getByRole("tab", { name: "Chat grupal" });
  group.focus();
  await user.keyboard("{ArrowRight}");
  expect(
    screen.getByRole("tab", { name: "Directo administrativo" }),
  ).toHaveFocus();
  expect(await screen.findByLabelText("Destinatario")).toBeVisible();
});
it("permite reintentar carga fallida y enviar después", async () => {
  const original = apiClient.getMockImplementation();
  let fail = true;
  apiClient.mockImplementation((path, options) =>
    path === "/chatMessages" && fail
      ? Promise.reject(new Error("Fallo temporal"))
      : original(path, options),
  );
  const { user } = mount();
  expect((await screen.findAllByText("Fallo temporal"))[0]).toBeVisible();
  expect(screen.getByRole("button", { name: "Enviar mensaje" })).toBeDisabled();
  fail = false;
  await user.click(screen.getByRole("button", { name: "Actualizar mensajes" }));
  expect(await screen.findByText("Informe del campo")).toBeVisible();
});

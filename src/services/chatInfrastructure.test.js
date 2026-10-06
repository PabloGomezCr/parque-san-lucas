import { beforeEach, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { chatService } from "./chatService";
import { apiClient } from "./apiClient";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import {
  masterActor,
  adminActor,
  rangerActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../test/fixtures/admin";
import { channelFactory, messageFactory } from "../test/fixtures/chat";
import { writeStorage } from "../utils/storage";
import { sessionKey } from "./sessionAccess";
let db;
beforeEach(() => {
  db = mockJsonServer({
    users: [
      masterActor,
      adminActor,
      rangerActor,
      parkWorker,
      foreignWorker,
      inactiveWorker,
    ],
  });
});
it("aísla canales, membresías y mensajes por parque", async () => {
  db.chatChannels.push(channelFactory({ id: "foreign-channel", parkId: "2" }));
  db.chatMessages.push(
    messageFactory(),
    messageFactory({
      id: "foreign",
      parkId: "2",
      channelId: "foreign-channel",
      senderUserId: foreignWorker.id,
    }),
    messageFactory({ id: "wrong-channel", channelId: "foreign-channel" }),
  );
  expect((await chatService.getMessages()).map((item) => item.id)).toEqual([
    "message-1",
  ]);
  expect(db.chatChannelMembers).toHaveLength(1);
  expect(db.chatChannelMembers[0]).toMatchObject({
    userId: masterActor.id,
    parkId: "1",
    channelId: "san-lucas-group",
  });
  const foreignAdmin = { ...adminActor, id: "foreign-admin", parkId: "2" };
  db.users.push(foreignAdmin);
  writeStorage(sessionKey, foreignAdmin);
  expect((await chatService.getMessages()).map((item) => item.id)).toEqual([
    "foreign",
  ]);
});
it("bloquea sesión externa falsificada, usuario inactivo y membresía revocada", async () => {
  writeStorage(sessionKey, { ...masterActor, parkId: "2" });
  await expect(chatService.getMessages()).rejects.toThrow();
  writeStorage(sessionKey, masterActor);
  db.users[0].active = false;
  await expect(
    chatService.sendMessage({ kind: "group", text: "Bloqueado" }),
  ).rejects.toThrow();
  db.users[0].active = true;
  db.chatChannelMembers.push({
    id: "revoked",
    channelId: "san-lucas-group",
    userId: masterActor.id,
    parkId: "1",
    active: false,
  });
  await expect(chatService.getMessages()).rejects.toThrow("No tienes acceso");
  expect(writes()).toHaveLength(0);
});
it("resuelve remitente actual por id sin almacenar nombre, rol ni contraseña", async () => {
  const raw = await chatService.sendMessage({
    kind: "group",
    text: "Hola",
    senderName: "Falso",
    senderRole: "Falso",
  });
  expect(raw).not.toHaveProperty("senderName");
  expect(raw).not.toHaveProperty("senderRole");
  db.users[0].name = "Nombre actualizado";
  expect((await chatService.getMessages())[0].sender).toEqual({
    id: masterActor.id,
    name: "Nombre actualizado",
    role: masterActor.role,
  });
  db.users.splice(0, 1);
  writeStorage(sessionKey, adminActor);
  expect((await chatService.getMessages())[0].sender.name).toBe(
    "Usuario no disponible",
  );
});
it("filtra contactos inactivos y ajenos sin conceder permiso directo a Guardaparque", async () => {
  const contacts = await chatService.getContacts();
  expect(contacts.map((item) => item.id)).not.toContain(inactiveWorker.id);
  expect(contacts.map((item) => item.id)).not.toContain(foreignWorker.id);
  writeStorage(sessionKey, rangerActor);
  await expect(chatService.getContacts()).rejects.toThrow("No tienes permiso");
  await expect(
    chatService.getMessages("direct", masterActor.id),
  ).rejects.toThrow("No tienes permiso");
});
it("reutiliza conversación directa en ambos sentidos y no expone terceros", async () => {
  const sent = await chatService.sendMessage({
    kind: "direct",
    recipientUserId: adminActor.id,
    text: "Uno",
  });
  writeStorage(sessionKey, adminActor);
  const reply = await chatService.sendMessage({
    kind: "direct",
    recipientUserId: masterActor.id,
    text: "Dos",
  });
  expect(reply.conversationId).toBe(sent.conversationId);
  expect(db.directConversations).toHaveLength(1);
  expect(await chatService.getMessages("direct", masterActor.id)).toHaveLength(
    2,
  );
  writeStorage(sessionKey, { ...rangerActor });
  db.users.find((item) => item.id === rangerActor.id).optionalPermissions = [
    "chat.direct_admin",
  ];
  expect(await chatService.getMessages("direct", masterActor.id)).toEqual([]);
});
it("creaciones concurrentes reutilizan la membresía y conversación", async () => {
  await Promise.all([
    chatService.getMessages(),
    chatService.getConversations(),
  ]);
  expect(db.chatChannelMembers).toHaveLength(1);
  await Promise.all(
    [1, 2].map((n) =>
      chatService.sendMessage({
        kind: "direct",
        recipientUserId: adminActor.id,
        text: `Mensaje ${n}`,
      }),
    ),
  );
  expect(db.directConversations).toHaveLength(1);
  expect(db.chatMessages).toHaveLength(2);
});
it("persiste lecturas por usuario, cuenta no leídos y rechaza marcar mensajes ajenos", async () => {
  db.chatMessages.push(
    messageFactory({ senderUserId: adminActor.id }),
    messageFactory({ id: "own", sentAt: "2026-10-05T14:01:00Z" }),
  );
  expect((await chatService.getConversations())[0].unread).toBe(1);
  await chatService.markRead("group", "", "own");
  expect((await chatService.getConversations())[0].unread).toBe(0);
  await chatService.markRead("group", "", "message-1");
  expect(db.chatChannelMembers[0].lastReadMessageId).toBe("own");
  await expect(chatService.markRead("group", "", "foreign")).rejects.toThrow(
    "no pertenece",
  );
  const direct = await chatService.sendMessage({
    kind: "direct",
    recipientUserId: adminActor.id,
    text: "Directo",
  });
  writeStorage(sessionKey, adminActor);
  expect(
    (await chatService.getConversations("direct")).find(
      (item) => item.id === masterActor.id,
    ).unread,
  ).toBe(1);
  await chatService.markRead("direct", masterActor.id, direct.id);
  expect(
    (await chatService.getConversations("direct")).find(
      (item) => item.id === masterActor.id,
    ).unread,
  ).toBe(0);
  expect(
    db.directConversations[0].lastReadByUser[masterActor.id],
  ).toBeUndefined();
});
it("rechaza mensajes largos y propaga fallos de red sin crear conversaciones", async () => {
  await expect(
    chatService.sendMessage({
      kind: "direct",
      recipientUserId: adminActor.id,
      text: "a".repeat(2001),
    }),
  ).rejects.toThrow("2000");
  expect(writes()).toHaveLength(0);
  const original = apiClient.getMockImplementation();
  apiClient.mockImplementation((path, options) =>
    path === "/chatChannels"
      ? Promise.reject(new Error("Red interrumpida"))
      : original(path, options),
  );
  await expect(chatService.getMessages()).rejects.toThrow("Red interrumpida");
});

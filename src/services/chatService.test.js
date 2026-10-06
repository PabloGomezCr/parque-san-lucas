import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("./apiClient", () => ({ apiClient: vi.fn() }));
import { chatService } from "./chatService";
import { mockJsonServer, writes } from "../test/mocks/jsonServer";
import {
  masterActor,
  parkWorker,
  foreignWorker,
  inactiveWorker,
} from "../test/fixtures/admin";
describe("chatService: MASTER_ADMIN", () => {
  beforeEach(() => mockJsonServer());
  it("envía y consulta chat grupal trazable del parque", async () => {
    const message = await chatService.sendMessage({
      kind: "group",
      text: "Mensaje ficticio",
      parkId: "2",
      senderUserId: "otro",
    });
    expect(message).toMatchObject({
      parkId: "1",
      senderUserId: masterActor.id,
      channelId: "san-lucas-group",
      conversationId: null,
      kind: "group",
    });
    expect(message).not.toHaveProperty("senderName");
    expect(message).not.toHaveProperty("senderRole");
    expect(await chatService.getMessages("group")).toEqual([
      {
        ...message,
        sender: {
          id: masterActor.id,
          name: masterActor.name,
          role: masterActor.role,
        },
      },
    ]);
  });
  it("envía chat directo administrativo a usuario activo del parque", async () => {
    const message = await chatService.sendMessage({
      kind: "direct",
      recipientUserId: parkWorker.id,
      text: "Coordinación ficticia",
    });
    expect(await chatService.getMessages("direct", parkWorker.id)).toEqual([
      {
        ...message,
        sender: {
          id: masterActor.id,
          name: masterActor.name,
          role: masterActor.role,
        },
      },
    ]);
    const contacts = await chatService.getContacts();
    expect(contacts.map((user) => user.id)).toEqual([parkWorker.id]);
    expect(contacts[0]).not.toHaveProperty("password");
  });
  it("filtra mensajes de otro parque y conversaciones entre terceros", async () => {
    mockJsonServer({
      directConversations: [
        {
          id: "pair",
          parkId: "1",
          userIds: [masterActor.id, parkWorker.id],
          lastReadByUser: {},
        },
        {
          id: "third-pair",
          parkId: "1",
          userIds: [parkWorker.id, "otro"],
          lastReadByUser: {},
        },
      ],
      chatMessages: [
        {
          id: "foreign",
          parkId: "2",
          kind: "group",
          text: "Privado de otro parque",
        },
        {
          id: "third",
          parkId: "1",
          kind: "direct",
          senderUserId: parkWorker.id,
          conversationId: "third-pair",
          text: "Entre terceros",
        },
        {
          id: "reply",
          parkId: "1",
          kind: "direct",
          senderUserId: parkWorker.id,
          conversationId: "pair",
          text: "Respuesta",
        },
      ],
    });
    expect(await chatService.getMessages("group")).toEqual([]);
    expect(
      (await chatService.getMessages("direct", parkWorker.id)).map(
        (item) => item.id,
      ),
    ).toEqual(["reply"]);
  });
  it.each([foreignWorker.id, inactiveWorker.id])(
    "rechaza destinatario ajeno o inactivo: %s",
    async (id) => {
      await expect(
        chatService.sendMessage({
          kind: "direct",
          recipientUserId: id,
          text: "Prueba",
        }),
      ).rejects.toThrow();
      expect(writes()).toHaveLength(0);
    },
  );
  it("rechaza canal desconocido y mensajes vacíos", async () => {
    await expect(
      chatService.sendMessage({ kind: "national", text: "Prueba" }),
    ).rejects.toThrow("Canal inválido");
    await expect(
      chatService.sendMessage({ kind: "group", text: "   " }),
    ).rejects.toThrow("Escribe un mensaje");
    expect(writes()).toHaveLength(0);
  });
});

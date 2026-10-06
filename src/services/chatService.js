import { chatRepository as db } from "../repositories/chatRepository";
import { requireActor, requireSamePark, safeUser } from "./sessionAccess";
import { samePark } from "../config/permissions";
const pending = new Map();
async function serialize(key, action) {
  const operation = (pending.get(key) || Promise.resolve())
    .catch(() => {})
    .then(action);
  pending.set(key, operation);
  try {
    return await operation;
  } finally {
    if (pending.get(key) === operation) pending.delete(key);
  }
}
async function context(kind, recipientId, create = false) {
  if (!["group", "direct"].includes(kind)) throw new Error("Canal inválido.");
  const actor = await requireActor(
    kind === "group" ? "chat.group" : "chat.direct_admin",
  );
  if (kind === "group") {
    const channel = (await db.chatChannels.getAll()).find(
      (item) =>
        samePark(actor, item) && item.kind === "group" && item.active === true,
    );
    if (!channel) throw new Error("No hay un canal activo para este parque.");
    const member = await serialize(
      `member:${channel.id}:${actor.id}`,
      async () => {
        const existing = (await db.chatChannelMembers.getAll()).find(
          (item) =>
            samePark(actor, item) &&
            String(item.channelId) === String(channel.id) &&
            String(item.userId) === String(actor.id),
        );
        if (existing?.active === false)
          throw new Error("No tienes acceso a este canal.");
        return (
          existing ||
          db.chatChannelMembers.create({
            channelId: channel.id,
            userId: actor.id,
            parkId: actor.parkId,
            active: true,
            joinedAt: new Date().toISOString(),
            lastReadMessageId: null,
          })
        );
      },
    );
    return { actor, channel, member, kind };
  }
  const recipient = requireSamePark(actor, await db.users.getById(recipientId));
  if (recipient.active !== true || String(recipient.id) === String(actor.id))
    throw new Error("Selecciona un destinatario activo del parque.");
  const userIds = [String(actor.id), String(recipient.id)].sort();
  const conversation = await serialize(
    `direct:${actor.parkId}:${JSON.stringify(userIds)}`,
    async () => {
      const existing = (await db.directConversations.getAll()).find(
        (item) =>
          samePark(actor, item) &&
          item.userIds?.length === 2 &&
          userIds.every((id) => item.userIds.map(String).includes(id)),
      );
      return (
        existing ||
        (create
          ? db.directConversations.create({
              parkId: actor.parkId,
              userIds,
              createdByUserId: actor.id,
              createdAt: new Date().toISOString(),
              lastReadByUser: {},
            })
          : null)
      );
    },
  );
  return { actor, recipient, conversation, kind };
}
const belongs = (ctx, message) =>
  samePark(ctx.actor, message) &&
  message.kind === ctx.kind &&
  (ctx.kind === "group"
    ? String(message.channelId) === String(ctx.channel.id)
    : Boolean(ctx.conversation) &&
      String(message.conversationId) === String(ctx.conversation.id) &&
      ctx.conversation.userIds
        .map(String)
        .includes(String(message.senderUserId)));
const ordered = (messages) =>
  [...messages].sort(
    (a, b) =>
      String(a.sentAt).localeCompare(String(b.sentAt)) ||
      String(a.id).localeCompare(String(b.id)),
  );
const unreadCount = (messages, marker, actorId) => {
  const index = marker
    ? messages.findIndex((item) => String(item.id) === String(marker))
    : -1;
  return messages
    .slice(index + 1)
    .filter((item) => String(item.senderUserId) !== String(actorId)).length;
};
export const chatService = {
  async getContacts() {
    const actor = await requireActor("chat.direct_admin");
    return (await db.users.getAll())
      .filter(
        (user) =>
          samePark(actor, user) &&
          user.active === true &&
          String(user.id) !== String(actor.id),
      )
      .map(safeUser);
  },
  async getMessages(kind = "group", recipientId = "") {
    const ctx = await context(kind, recipientId);
    const [allMessages, allUsers] = await Promise.all([
      db.chatMessages.getAll(),
      db.users.getAll(),
    ]);
    const senders = new Map(
      allUsers
        .filter((user) => samePark(ctx.actor, user))
        .map((user) => [
          String(user.id),
          { id: user.id, name: user.name, role: user.role },
        ]),
    );
    return ordered(allMessages.filter((message) => belongs(ctx, message))).map(
      (message) => {
        const { senderName: _name, senderRole: _role, ...normalized } = message;
        return {
          ...normalized,
          sender: senders.get(String(message.senderUserId)) || {
            id: message.senderUserId,
            name: "Usuario no disponible",
          },
        };
      },
    );
  },
  async sendMessage({ kind, recipientUserId, text }) {
    if (!["group", "direct"].includes(kind)) throw new Error("Canal inválido.");
    // Validate before enrollment/conversation creation.
    await requireActor(kind === "group" ? "chat.group" : "chat.direct_admin");
    const content = text?.trim();
    if (!content || content.length > 2000)
      throw new Error("Escribe un mensaje de entre 1 y 2000 caracteres.");
    const ctx = await context(kind, recipientUserId, true);
    return db.chatMessages.create({
      kind,
      channelId: kind === "group" ? ctx.channel.id : null,
      conversationId: kind === "direct" ? ctx.conversation.id : null,
      text: content,
      senderUserId: ctx.actor.id,
      parkId: ctx.actor.parkId,
      sentAt: new Date().toISOString(),
      mock: true,
    });
  },
  async markRead(kind, recipientId, messageId) {
    const ctx = await context(kind, recipientId);
    const messages = ordered(
      (await db.chatMessages.getAll()).filter((message) =>
        belongs(ctx, message),
      ),
    );
    if (!messages.some((message) => String(message.id) === String(messageId)))
      throw new Error("El mensaje no pertenece a esta conversación.");
    const key =
      kind === "group"
        ? `read:member:${ctx.member.id}`
        : `read:direct:${ctx.conversation.id}`;
    return serialize(key, async () => {
      const repository =
        kind === "group" ? db.chatChannelMembers : db.directConversations;
      const latest = requireSamePark(
        ctx.actor,
        await repository.getById(
          kind === "group" ? ctx.member.id : ctx.conversation.id,
        ),
      );
      const currentId =
        kind === "group"
          ? latest.lastReadMessageId
          : latest.lastReadByUser?.[ctx.actor.id];
      if (
        messages.findIndex((item) => String(item.id) === String(currentId)) >
        messages.findIndex((item) => String(item.id) === String(messageId))
      )
        return latest;
      return repository.patch(
        latest.id,
        kind === "group"
          ? { lastReadMessageId: messageId }
          : {
              lastReadByUser: {
                ...(latest.lastReadByUser || {}),
                [ctx.actor.id]: messageId,
              },
            },
      );
    });
  },
  async getConversations(kind = "group") {
    if (kind === "group") {
      const ctx = await context("group");
      const messages = ordered(
        (await db.chatMessages.getAll()).filter((message) =>
          belongs(ctx, message),
        ),
      );
      return [
        {
          id: ctx.channel.id,
          name: ctx.channel.name,
          unread: unreadCount(
            messages,
            ctx.member.lastReadMessageId,
            ctx.actor.id,
          ),
        },
      ];
    }
    if (kind !== "direct") throw new Error("Canal inválido.");
    const actor = await requireActor("chat.direct_admin");
    const [contacts, conversations, messages] = await Promise.all([
      chatService.getContacts(),
      db.directConversations.getAll(),
      db.chatMessages.getAll(),
    ]);
    return contacts.map((contact) => {
      const conversation = conversations.find(
        (item) =>
          samePark(actor, item) &&
          item.userIds?.length === 2 &&
          item.userIds.map(String).includes(String(actor.id)) &&
          item.userIds.map(String).includes(String(contact.id)),
      );
      const ctx = { actor, kind: "direct", conversation };
      return {
        ...contact,
        conversationId: conversation?.id,
        unread: unreadCount(
          ordered(messages.filter((message) => belongs(ctx, message))),
          conversation?.lastReadByUser?.[actor.id],
          actor.id,
        ),
      };
    });
  },
};

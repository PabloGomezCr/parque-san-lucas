export const channelFactory = (overrides = {}) => ({
  id: "san-lucas-group",
  parkId: "1",
  kind: "group",
  name: "Parque Nacional Isla San Lucas",
  active: true,
  ...overrides,
});
export const messageFactory = (overrides = {}) => ({
  id: "message-1",
  parkId: "1",
  kind: "group",
  channelId: "san-lucas-group",
  conversationId: null,
  senderUserId: "admin-mock",
  text: "Mensaje ficticio",
  sentAt: "2026-10-05T14:00:00Z",
  ...overrides,
});

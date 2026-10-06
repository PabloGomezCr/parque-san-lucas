import { createRepository } from "./createRepository";
// Replace this adapter when moving away from JSON Server; consumers use chatService.
export const chatRepository = Object.fromEntries(
  [
    "users",
    "chatChannels",
    "chatChannelMembers",
    "chatMessages",
    "directConversations",
  ].map((resource) => [resource, createRepository({ resource })]),
);

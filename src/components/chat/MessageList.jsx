import { MessageBubble } from "./MessageBubble";
export function MessageList({ messages, actorId, selectRecipient }) {
  return (
    <div
      className="chat-messages"
      role="log"
      aria-label="Mensajes de la conversación"
      aria-live="polite"
    >
      {messages.length ? (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            own={String(message.senderUserId) === String(actorId)}
          />
        ))
      ) : (
        <p>
          {selectRecipient
            ? "Selecciona un destinatario."
            : "No hay mensajes todavía."}
        </p>
      )}
    </div>
  );
}

import { roleLabel } from "../../config/roles";
export function MessageBubble({ message, own }) {
  return (
    <article className={`chat-message${own ? " chat-message--own" : ""}`}>
      <p>
        <strong>{message.sender.name}</strong>
        {message.sender.role && (
          <span className="muted"> · {roleLabel(message.sender.role)}</span>
        )}
      </p>
      <p className="chat-message-text">{message.text}</p>
      <time dateTime={message.sentAt}>
        {new Date(message.sentAt).toLocaleString("es-CR")}
      </time>
    </article>
  );
}

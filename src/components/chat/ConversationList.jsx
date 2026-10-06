import { FormField } from "../forms/FormField";
import { UnreadBadge } from "./UnreadBadge";
export function ConversationList({
  kind,
  conversations,
  recipient,
  onSelect,
  disabled,
}) {
  return (
    <aside
      className="chat-conversations"
      aria-label="Conversaciones del parque"
    >
      {kind === "group" ? (
        conversations.map((channel) => (
          <p key={channel.id}>
            <strong>{channel.name}</strong>{" "}
            <UnreadBadge count={channel.unread} />
          </p>
        ))
      ) : (
        <>
          <FormField label="Destinatario">
            <select
              value={recipient}
              disabled={disabled}
              onChange={(event) => onSelect(event.target.value)}
            >
              <option value="">Selecciona un usuario activo del parque</option>
              {conversations.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </FormField>
          <ul className="chat-contact-list">
            {conversations
              .filter((contact) => contact.unread > 0)
              .map((contact) => (
                <li key={contact.id}>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(String(contact.id))}
                  >
                    {contact.name} <UnreadBadge count={contact.unread} />
                  </button>
                </li>
              ))}
          </ul>
        </>
      )}
    </aside>
  );
}

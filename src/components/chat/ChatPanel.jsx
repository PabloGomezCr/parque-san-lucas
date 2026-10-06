import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { useMutation } from "../../hooks/useMutation";
import { chatService } from "../../services/chatService";
import { Tabs } from "../common/Tabs";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { ErrorState } from "../feedback/ErrorState";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import "./chat.scss";
const loadMessages = (key) => {
  const [kind, recipient] = JSON.parse(key);
  return kind === "direct" && !recipient
    ? Promise.resolve([])
    : chatService.getMessages(kind, recipient);
};
const loadConversations = (kind) => chatService.getConversations(kind);
export function ChatPanel() {
  const { can, user } = useAuth();
  const [kind, setKind] = useState(() =>
    can("chat.group") ? "group" : "direct",
  );
  const [recipient, setRecipient] = useState("");
  const [readError, setReadError] = useState("");
  const allowed = can(kind === "group" ? "chat.group" : "chat.direct_admin");
  return (
    <>
      <ChatHeader />
      {allowed ? (
        <ChatConversation
          key={user?.id}
          kind={kind}
          setKind={setKind}
          recipient={recipient}
          setRecipient={setRecipient}
          can={can}
          actorId={user?.id}
          readError={readError}
          setReadError={setReadError}
        />
      ) : (
        <p role="alert">No tienes permiso para usar esta conversación.</p>
      )}
    </>
  );
}
function ChatConversation({
  kind,
  setKind,
  recipient,
  setRecipient,
  can,
  actorId,
  readError,
  setReadError,
}) {
  const conversations = useResource(loadConversations, kind);
  const messages = useResource(loadMessages, JSON.stringify([kind, recipient]));
  const mutation = useMutation(chatService.sendMessage);
  const reloadConversations = conversations.reload;
  useEffect(() => {
    let cancelled = false;
    const latest = messages.data?.at(-1);
    if (latest)
      chatService.markRead(kind, recipient, latest.id).then(
        () => {
          if (!cancelled) {
            setReadError("");
            reloadConversations();
          }
        },
        (error) => {
          if (!cancelled) setReadError(error.message);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [messages.data, kind, recipient, reloadConversations, setReadError]);
  const select = (value) => {
    if (!mutation.busy) {
      setRecipient(value);
      mutation.clearError();
      setReadError("");
    }
  };
  const refresh = () => {
    messages.reload();
    conversations.reload();
  };
  return (
    <Tabs
      label="Tipos de conversación"
      value={kind}
      onChange={(value) => {
        if (!mutation.busy) {
          mutation.clearError();
          setKind(value);
          setRecipient("");
          setReadError("");
        }
      }}
      options={[
        ...(can("chat.group")
          ? [{ value: "group", label: "Chat grupal" }]
          : []),
        ...(can("chat.direct_admin")
          ? [{ value: "direct", label: "Directo administrativo" }]
          : []),
      ]}
    >
      <div className="chat-layout">
        {conversations.loading ? (
          <LoadingSkeleton rows={1} />
        ) : conversations.error ? (
          <ErrorState message={conversations.error} onRetry={refresh} />
        ) : (
          <ConversationList
            kind={kind}
            conversations={conversations.data || []}
            recipient={recipient}
            onSelect={select}
            disabled={mutation.busy}
          />
        )}
        <div className="stack chat-content">
          <Card
            title={
              kind === "group" ? "Conversación grupal" : "Conversación directa"
            }
          >
            {messages.loading ? (
              <LoadingSkeleton rows={2} />
            ) : messages.error ? (
              <ErrorState message={messages.error} onRetry={refresh} />
            ) : (
              <MessageList
                messages={messages.data || []}
                actorId={actorId}
                selectRecipient={kind === "direct" && !recipient}
              />
            )}
            <Button
              variant="secondary"
              onClick={refresh}
              disabled={mutation.busy}
            >
              Actualizar mensajes
            </Button>
            {readError && <p role="alert">{readError}</p>}
          </Card>
          <MessageComposer
            key={`${kind}/${recipient}`}
            busy={mutation.busy}
            disabled={kind === "direct" && !recipient}
            sendDisabled={Boolean(
              messages.loading || messages.error || conversations.error,
            )}
            error={mutation.error}
            onSend={async (text) => {
              const result = await mutation.run({
                kind,
                recipientUserId: recipient,
                text,
              });
              if (result) refresh();
              return result;
            }}
          />
        </div>
      </div>
    </Tabs>
  );
}

import { useState } from "react";
import { FormField } from "../forms/FormField";
import { Button } from "../common/Button";
export function MessageComposer({
  onSend,
  busy,
  disabled,
  sendDisabled,
  error,
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || sendDisabled || busy || !text.trim()) return;
        if (await onSend(text)) setText("");
      }}
    >
      <FormField label="Mensaje" required>
        <textarea
          value={text}
          maxLength={2000}
          required
          disabled={disabled || busy}
          onChange={(event) => setText(event.target.value)}
        />
      </FormField>
      {error && <p role="alert">{error}</p>}
      <Button
        type="submit"
        disabled={disabled || sendDisabled || busy || !text.trim()}
      >
        {busy ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}

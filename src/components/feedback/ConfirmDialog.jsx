import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
export function ConfirmDialog({
  open = true,
  title = "Confirmar acción",
  message,
  onConfirm,
  onCancel,
  busy = false,
  error,
  destructive = false,
  confirmLabel = "Confirmar",
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel} busy={busy}>
      <p>{message}</p>
      {error && (
        <p role="alert" className="form-alert">
          {error}
        </p>
      )}
      <div className="row">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Guardando…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

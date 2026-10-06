import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import "../feedback/feedback.scss";
export function Modal({
  open,
  onClose,
  title,
  children,
  drawer = false,
  busy = false,
}) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${drawer ? "modal--drawer" : ""}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal__header">
        <h2 id={titleId}>{title}</h2>
        <IconButton label="Cerrar diálogo" disabled={busy} onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      <div className="modal__content">{open && children}</div>
    </dialog>
  );
}
export function Drawer(props) {
  return <Modal {...props} drawer />;
}

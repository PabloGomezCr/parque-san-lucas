import { useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "../common/Button";
export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return message ? (
    <div className="toast" role="status">
      {message}
      {onClose && (
        <IconButton label="Cerrar aviso" onClick={onClose}>
          <X size={16} />
        </IconButton>
      )}
    </div>
  ) : null;
}

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
export function useRecordActions(config, item, reload) {
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const cancel = () => {
    if (!lock.current) {
      setAction(null);
      setError("");
    }
  };
  const confirm = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (action === "remove") {
        await config.remove(item.id);
        navigate(config.path, {
          state: { message: "Registro eliminado correctamente." },
        });
      } else {
        await config.update(item.id, {
          status: action,
          updatedAt: new Date().toISOString(),
        });
        setAction(null);
        await reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { action, setAction, busy, error, cancel, confirm };
}

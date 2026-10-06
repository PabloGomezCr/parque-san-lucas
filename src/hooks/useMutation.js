import { useRef, useState } from "react";
export function useMutation(action) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (...args) => {
    if (lock.current) return undefined;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      return await action(...args);
    } catch (err) {
      setError(err.message);
      return undefined;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { run, busy, error, clearError: () => setError("") };
}

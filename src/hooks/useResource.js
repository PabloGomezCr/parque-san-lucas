import { useCallback, useEffect, useState } from "react";
export function useResource(loader, id) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => loader(id))
      .then(
        (data) => {
          if (!cancelled) setResult({ data, error: "", loader, id, revision });
        },
        (error) => {
          if (!cancelled)
            setResult({
              data: null,
              error: error.message,
              loader,
              id,
              revision,
            });
        },
      );
    return () => {
      cancelled = true;
    };
  }, [loader, id, revision]);
  const current =
    result?.loader === loader &&
    result?.id === id &&
    result?.revision === revision;
  return {
    data: current ? result.data : null,
    error: current ? result.error : "",
    loading: !current,
    reload,
  };
}

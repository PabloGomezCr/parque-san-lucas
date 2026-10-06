const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
export async function apiClient(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con los registros. Comprueba que JSON Server esté disponible e inténtalo de nuevo.",
    );
  }
  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "El registro solicitado no existe."
        : "No se pudo guardar o recuperar la información. Inténtalo de nuevo.",
    );
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

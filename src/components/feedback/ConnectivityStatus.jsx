import { Satellite } from "lucide-react";
export function ConnectivityStatus() {
  return (
    <span className="row connectivity-status">
      <Satellite size={16} />
      <small>Enlace satelital · mock / por validar</small>
    </span>
  );
}

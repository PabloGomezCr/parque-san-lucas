import { useContext } from "react";
import { hasPermission, isActiveUser } from "../config/permissions";
import { AuthContext } from "../context/contexts";
export function useAuth() {
  const auth = useContext(AuthContext);
  return {
    ...auth,
    isAuthenticated: Boolean(auth?.isAuthenticated && isActiveUser(auth.user)),
    can: (permission) => hasPermission(auth?.user, permission),
  };
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function ProtectedRoute({ permission, permissions, children }) {
  const { isAuthenticated, can } = useAuth();
  const location = useLocation();
  const permitted = permission
    ? can(permission)
    : !permissions || permissions.some(can);
  if (isAuthenticated)
    return !permitted ? (
      <Navigate to="/unauthorized" replace />
    ) : (
      children || <Outlet />
    );
  return (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
}

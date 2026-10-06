import { isActiveUser } from "../config/permissions";
import { useState } from "react";
import { authService } from "../services/authService";
import { readStorage, writeStorage } from "../utils/storage";
import { AuthContext } from "./contexts";
const key = "parque-isla-san-lucas-auth";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(key));
  const updateUser = (value) => {
    setUser(value);
    writeStorage(key, value);
  };
  const login = async (credentials) => {
    const result = await authService.login(credentials);
    updateUser(result);
    return result;
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout: () => updateUser(null),
        updateUser,
        isAuthenticated: isActiveUser(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

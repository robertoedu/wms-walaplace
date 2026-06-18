import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("wms_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const result = authService.login(username, password);

    if (result.success) {
      setUser(result.user);
      localStorage.setItem("wms_user", JSON.stringify(result.user));
      return { success: true };
    }

    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wms_user");
  };

  const hasPermission = (moduleId) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.permissions.includes(moduleId);
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

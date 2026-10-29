import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("farmtech-token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("farmtech-token");

      if (!savedToken) {
        setToken("");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(response.user || null);
        setLoading(false);
      } catch (error) {
        localStorage.removeItem("farmtech-token");
        setToken("");
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (payload) => {
    const response = await loginUser(payload);
    localStorage.setItem("farmtech-token", response.token);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    localStorage.setItem("farmtech-token", response.token);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("farmtech-token");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };

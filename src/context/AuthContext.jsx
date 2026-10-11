import { useState } from "react";
import AuthContext from "./auth-context.js";
import api from "../services/api.js";

const getResponseData = (response) => {
  return response.data?.data ?? response.data;
};

const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getInitialSession = () => {
  try {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const user = JSON.parse(savedUser);

      if (user && typeof user === "object" && !Array.isArray(user)) {
        return { token, user };
      }
    }
  } catch (error) {
    console.error("Could not restore the saved session:", error);
  }

  clearSession();

  return {
    token: null,
    user: null,
  };
};

export function AuthProvider({ children }) {
  const [initialSession] = useState(getInitialSession);

  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);

  const establishSession = (authData) => {
    const responseData = authData?.data ?? authData;

    const receivedToken = responseData?.token;
    const receivedUser = responseData?.user;

    if (!receivedToken || !receivedUser) {
      throw new Error(
        "The server did not return both an authentication token and user."
      );
    }

    saveSession(receivedToken, receivedUser);

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const signup = async (userData) => {
    const response = await api.post("/auth/signup", userData);
    const responseData = getResponseData(response);

    if (responseData?.token && responseData?.user) {
      establishSession(responseData);
    }

    return responseData;
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const responseData = getResponseData(response);

    establishSession(responseData);

    return responseData;
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading: false,
    isAuthenticated: Boolean(token && user),
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
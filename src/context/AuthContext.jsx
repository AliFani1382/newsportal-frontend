import { createContext, useCallback, useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import * as profileApi from "../api/profileApi";

export const AuthContext = createContext(null);

const TOKEN_KEY = "np_token";
const USER_KEY = "np_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const persistUser = useCallback((profile) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
  }, [persistUser]);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      persistUser(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const response = await profileApi.getMyProfile();
      if (response.isSuccess) {
        persistUser(response.data);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setIsAuthLoading(false);
    }
  }, [clearSession, persistUser]);

  useEffect(() => {
    refreshProfile();

    const handleAuthExpired = () => {
      clearSession();
    };

    window.addEventListener("np-auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("np-auth-expired", handleAuthExpired);
    };
  }, [clearSession, refreshProfile]);

  const login = useCallback(
    async (usernameOrEmail, password) => {
      const response = await authApi.login({ usernameOrEmail, password });
      if (!response.isSuccess) {
        throw new Error(response.message || "ورود ناموفق بود.");
      }

      localStorage.setItem(TOKEN_KEY, response.data.token);

      const profileResponse = await profileApi.getMyProfile();
      if (profileResponse.isSuccess) {
        persistUser(profileResponse.data);
      } else {
        clearSession();
        throw new Error(
          profileResponse.message || "دریافت پروفایل پس از ورود ناموفق بود.",
        );
      }

      return response.data;
    },
    [clearSession, persistUser],
  );

  const register = useCallback(async (fullName, username, email, password) => {
    const response = await authApi.register({
      fullName,
      username,
      email,
      password,
    });
    if (!response.isSuccess) {
      throw new Error(response.message || "ثبت‌نام ناموفق بود.");
    }
    return response.data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

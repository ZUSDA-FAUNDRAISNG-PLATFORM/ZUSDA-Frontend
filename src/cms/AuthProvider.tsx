import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { apiPost, getStoredToken, setStoredToken } from "@/api/client";
import { LOCAL_ADMIN_TOKEN, notifyAdminSessionChanged } from "@/lib/testAdmin";
import type { CmsUser, UserRole } from "./types";
import { useCms } from "./CmsProvider";
import { hashPassword } from "./utils";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; username: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: CmsUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { state, addUser } = useCms();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const localId = Number(token.replace(`${LOCAL_ADMIN_TOKEN}:`, ""));
    const match = state.users.find((item) => item.id === localId) ?? (token === LOCAL_ADMIN_TOKEN ? state.users.find((item) => item.role === "admin") : null);
    setUser(match ? toAuthUser(match) : null);
    setLoading(false);
  }, [state.users]);

  const login = async (username: string, password: string) => {
    try {
      const payload = await apiPost<{ access_token: string; admin?: AuthUser; user?: AuthUser }>("/auth/login", {
        username,
        password,
      });
      setStoredToken(payload.access_token);
      const next = payload.user || payload.admin;
      if (next) {
        setUser({ ...next, role: next.role || "admin" });
        notifyAdminSessionChanged();
        return { ...next, role: next.role || "admin" };
      }
    } catch {
      // local CMS auth
    }

    const hash = await hashPassword(password);
    const match = state.users.find(
      (item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.passwordHash === hash,
    );
    if (!match) {
      throw new Error("Invalid username or password");
    }
    setStoredToken(`${LOCAL_ADMIN_TOKEN}:${match.id}`);
    const next = toAuthUser(match);
    setUser(next);
    notifyAdminSessionChanged();
    return next;
  };

  const register = async (input: { name: string; email: string; username: string; password: string }) => {
    if (state.users.some((item) => item.username.toLowerCase() === input.username.trim().toLowerCase())) {
      throw new Error("That username is already taken");
    }
    const created = addUser({
      name: input.name.trim(),
      email: input.email.trim(),
      username: input.username.trim(),
      passwordHash: await hashPassword(input.password),
      role: "member",
    });
    setStoredToken(`${LOCAL_ADMIN_TOKEN}:${created.id}`);
    const next = toAuthUser(created);
    setUser(next);
    notifyAdminSessionChanged();
    return next;
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    notifyAdminSessionChanged();
    toast.success("Signed out.");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, state.users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

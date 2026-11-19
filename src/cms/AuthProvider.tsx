import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  ApiError,
  apiGet,
  apiPost,
  getStoredToken,
  setStoredToken,
} from "@/api/client";
import { notifyAdminSessionChanged } from "@/lib/adminSession";
import type { UserRole } from "./types";

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
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Normalize backend roles without destroying
 * the distinction between administrator levels.
 */
export function normalizeRole(role?: string): UserRole {
  if (!role) return "member";

  if (
    role === "super_admin" ||
    role === "admin" ||
    role === "editor" ||
    role === "member"
  ) {
    return role;
  }

  return "member";
}

/**
 * Returns true for every administrative role.
 */
export function isAdminRole(role?: UserRole): boolean {
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "editor"
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    apiGet<AuthUser>("/auth/me")
      .then((me) => {
        if (!cancelled) {
          setUser({
            ...me,
            name: me.name || me.username,
            role: normalizeRole(me.role),
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;

        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 422)
        ) {
          setStoredToken(null);
        }

        setUser(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (
    username: string,
    password: string
  ) => {
    const payload = await apiPost<{
      access_token: string;
      admin?: Omit<AuthUser, "name"> & { name?: string };
      user?: AuthUser;
    }>("/auth/login", {
      username,
      password,
    });

    const next = payload.user || payload.admin;
    if (!payload.access_token || !next) {
      throw new Error("The server returned an invalid login response.");
    }

    setStoredToken(payload.access_token);
    const normalized = {
      ...next,
      name: next.name || next.username,
      role: normalizeRole(next.role),
    };
    setUser(normalized);
    notifyAdminSessionChanged();
    return normalized;
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
      logout,
      isAdmin: isAdminRole(user?.role),
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}
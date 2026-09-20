import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/cms/AuthProvider";
import type { UserRole } from "@/cms/types";

export function RequireAuth({
  role,
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-navy/60">
        Checking access…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/dashboard" : "/account"} replace />;
  }

  return <>{children}</>;
}

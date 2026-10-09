import { useStore } from "@/lib/store";
import type { Role } from "@/types";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function RequireAuth({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { session, patch } = useStore();
  const loc = useLocation();

  if (!session) {
    const to = roles.includes("student") ? "/student/login" : "/admin/login";
    return <Navigate to={to} replace state={{ from: loc.pathname }} />;
  }

  if (!roles.includes(session.role)) {
    if (session.role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

export function RedirectIfAuthed({
  children,
  portal,
}: {
  children: ReactNode;
  portal: "student" | "admin";
}) {
  const { session } = useStore();
  if (session) {
    if (portal === "student" && session.role === "student") return <Navigate to="/student" replace />;
    if (portal === "admin" && (session.role === "admin" || session.role === "super_admin")) {
      return <Navigate to="/admin" replace />;
    }
  }
  return <>{children}</>;
}

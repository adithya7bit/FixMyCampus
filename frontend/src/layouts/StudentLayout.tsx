import { Logo } from "@/components/badges";
import { TextSizeControl, ThemeToggle } from "@/components/theme";
import { useStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import {
  Bell,
  ClipboardList,
  Home,
  Map,
  Plus,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

const NAV = [
  { to: "/student", label: "Home", icon: Home, end: true },
  { to: "/student/complaints", label: "My reports", icon: ClipboardList },
  { to: "/student/report", label: "Report", icon: Plus, prominent: true },
  { to: "/student/map", label: "Map", icon: Map },
  { to: "/student/profile", label: "Profile", icon: UserRound },
];

export function StudentLayout() {
  const { session, state } = useStore();
  const loc = useLocation();
  const nav = useNavigate();
  const unread = useMemo(
    () => state.notifications.filter((n) => n.userId === session?.id && !n.readAt).length,
    [state.notifications, session],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && loc.pathname !== "/student") nav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loc.pathname, nav]);

  return (
    <div className="flex h-dvh overflow-hidden bg-transparent">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md dark:border-[var(--border-glass-dark)] dark:bg-[var(--bg-glass-dark)] md:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV.filter((n) => n.to !== "/student/report").map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
          <NavLink
            to="/student/report"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" />
            File a complaint
          </NavLink>
        </nav>
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-sm font-semibold">{session?.fullName}</p>
          <p className="truncate text-xs text-slate-500">{session?.email}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-transparent">
        <header className="safe-top flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md px-4 dark:border-[var(--border-glass-dark)] dark:bg-[var(--bg-glass-dark)] md:h-16 md:px-6">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden text-sm text-slate-500 md:block">
            {session?.department} · {session?.year}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <TextSizeControl />
            <ThemeToggle />
            <NavLink
              to="/student/notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </NavLink>
          </div>
        </header>

        <main
          id="main"
          className={cn(
            "flex-1 min-h-0",
            loc.pathname === "/student/map"
              ? "p-0 overflow-hidden flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-4rem)]"
              : "overflow-y-auto px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8"
          )}
        >
          <Outlet />
        </main>
      </div>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-xl md:hidden dark:border-[var(--border-glass-dark)] dark:bg-[var(--bg-glass-dark)]"
        aria-label="Student"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.to} className="flex justify-center">
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
                    n.prominent && "-mt-4",
                    isActive && !n.prominent ? "text-brand-800" : "text-slate-500",
                  )
                }
              >
                {({ isActive }) =>
                  n.prominent ? (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-float">
                      <Plus className="h-5 w-5" />
                      <span className="sr-only">Report</span>
                    </span>
                  ) : (
                    <>
                      <n.icon className={cn("h-5 w-5", isActive && "text-brand-700")} />
                      {n.label}
                    </>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

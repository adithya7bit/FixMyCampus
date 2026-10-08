import { Logo } from "@/components/badges";
import { TextSizeControl, ThemeToggle } from "@/components/theme";
import { useStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  Users,
  BarChart3,
  Sliders,
  Radio,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/inbox", label: "Inbox", icon: ClipboardList },
  { to: "/admin/map", label: "Campus Map", icon: Map },
  { to: "/admin/operations", label: "Operations & Dispatch", icon: Radio },
  { to: "/admin/technicians", label: "Technicians", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/sla", label: "SLA Management", icon: Sliders },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];


export function AdminLayout() {
  const { session, state } = useStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const unread = useMemo(
    () => state.notifications.filter((n) => n.userId === session?.id && !n.readAt).length,
    [state.notifications, session],
  );

  const links = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium",
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
            )
          }
        >
          <n.icon className="h-4 w-4" />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-transparent">
      <aside className="hidden w-[240px] shrink-0 flex-col bg-slate-900/90 backdrop-blur-md text-white lg:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <Logo className="[&_span:last-child]:text-white" />
        </div>
        <p className="px-5 pb-2 text-[10px] font-semibold tracking-[0.16em] text-teal-400 uppercase">
          Admin portal
        </p>
        {links}
        <div className="border-t border-slate-800 p-4">
          <p className="text-sm font-semibold">{session?.fullName}</p>
          <p className="text-[11px] text-slate-400">
            {session?.role === "super_admin" ? "Super admin" : "Department admin"}
          </p>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative z-10 flex h-full w-[240px] flex-col bg-slate-900 text-white">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo className="[&_span:last-child]:text-white" />
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            {links}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-transparent">
        <header className="safe-top flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md px-3 dark:border-[var(--border-glass-dark)] dark:bg-[var(--bg-glass-dark)]">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-sm font-medium text-slate-500 sm:block">
            {session?.role === "super_admin" ? "Campus-wide" : session?.department} operations
          </p>
          <div className="ml-auto flex items-center gap-1">
            <TextSizeControl />
            <ThemeToggle />
            <NavLink
              to="/admin/inbox"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              aria-label="Inbox"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          </div>
        </header>
        <main
          id="main"
          className={cn(
            "flex-1 min-h-0",
            loc.pathname === "/admin/map"
              ? "p-0 overflow-hidden flex flex-col h-[calc(100dvh-3.5rem)]"
              : "overflow-y-auto px-4 py-5 md:px-6 md:py-6"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

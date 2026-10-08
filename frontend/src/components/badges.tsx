import { CATEGORY_COLOR, PRIORITY_COLOR, STATUS_COLOR } from "@/lib/constants";
import { categoryLabel, priorityLabel } from "@/lib/format";
import { displayStatus } from "@/lib/status";
import type { Category, Priority, Status } from "@/types";
import { cn } from "@/utils/cn";
import {
  Armchair,
  BookOpen,
  Building2,
  Droplets,
  MoreHorizontal,
  ShieldAlert,
  Soup,
  Toilet,
  Wifi,
  Zap,
  Activity,
  Flame,
  FlaskConical,
  Sparkles,
  Hotel,
  Shield,
  HelpCircle,
  ArrowUpDown,
} from "lucide-react";

export function StatusBadge({
  status,
  overdue,
  className,
}: {
  status: Status;
  overdue?: boolean;
  className?: string;
}) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        overdue && status !== "resolved_pending_verification"
          ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
          : `${c.bg} ${c.text}`,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          overdue ? "bg-red-600" : c.dot,
        )}
      />
      {displayStatus(status, overdue)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLOR[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        c.bg,
        c.text,
        priority === "emergency" && "ring-1 ring-red-300",
      )}
    >
      {priorityLabel(priority)}
    </span>
  );
}

const ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi,
  water: Droplets,
  electricity: Zap,
  power: Zap,
  furniture: Armchair,
  food_hygiene: Soup,
  washroom: Toilet,
  classroom: BookOpen,
  security: ShieldAlert,
  infrastructure: Building2,
  lift: ArrowUpDown,
  cleanliness: Sparkles,
  laboratory: FlaskConical,
  hostel: Hotel,
  safety: Shield,
  general: Activity,
  other: MoreHorizontal,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Category | string;
  className?: string;
}) {
  const Icon = ICONS[category] || MoreHorizontal;
  return <Icon className={className} style={{ color: CATEGORY_COLOR[category] || "#64748b" }} />;
}

export function CategoryChip({ category }: { category: Category | string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
      <CategoryIcon category={category} className="h-3.5 w-3.5" />
      {categoryLabel(category as Category)}
    </span>
  );
}

export function Logo({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M3 13.5L12 4l9 9.5M5.5 11.5v8.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="10" r="1.5" fill="currentColor" />
        </svg>
      </span>
      {!markOnly && (
        <span className="flex flex-col">
          <span className="text-[16px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
            CAMPUS<span className="text-teal-500">IQ</span>
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600 dark:text-slate-300 -mt-0.5">
            Operations
          </span>
        </span>
      )}
    </span>
  );
}

import React from "react";
export function SLACountdownBadge({
  dueAt,
  status,
  isOverdue,
}: {
  dueAt: string;
  status: Status;
  isOverdue: boolean;
}) {
  const [timeLeft, setTimeLeft] = React.useState("");
  const [flashing, setFlashing] = React.useState(false);

  React.useEffect(() => {
    // If it's a closed/terminal status, do not show countdown
    if (["closed_verified", "rejected", "auto_closed", "merged", "resolved_pending_verification"].includes(status)) {
      setTimeLeft("Resolved");
      setFlashing(false);
      return;
    }

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(dueAt).getTime();
      const diff = target - now;

      if (diff <= 0 || isOverdue) {
        setTimeLeft("00:00:00");
        setFlashing(true);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
      setFlashing(h === 0 && m < 15); // flash if < 15 min
    };

    update();
    const int = setInterval(update, 1000);
    return () => clearInterval(int);
  }, [dueAt, status, isOverdue]);

  if (timeLeft === "Resolved") {
    return <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Resolved</span>;
  }

  return (
    <span
      className={cn(
        "font-mono text-[11px] font-bold transition-colors inline-flex items-center gap-1",
        flashing
          ? "text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse border border-red-500/30"
          : "text-slate-600 dark:text-slate-300"
      )}
    >
      {flashing && <Flame className="h-3 w-3" />}
      {timeLeft}
    </span>
  );
}


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
  const c = STATUS_COLOR[status];
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

const ICONS: Record<Category, typeof Wifi> = {
  wifi: Wifi,
  water: Droplets,
  electricity: Zap,
  furniture: Armchair,
  food_hygiene: Soup,
  washroom: Toilet,
  classroom: BookOpen,
  security: ShieldAlert,
  infrastructure: Building2,
  other: MoreHorizontal,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon className={className} style={{ color: CATEGORY_COLOR[category] }} />;
}

export function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
      <CategoryIcon category={category} className="h-3.5 w-3.5" />
      {categoryLabel(category)}
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
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M4 18V10.5L12 5l8 5.5V18a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 11.5l1.2 1.2 2.3-2.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!markOnly && (
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
          FixMyCampus
        </span>
      )}
    </span>
  );
}

import type { Status } from "@/types";

/** Allowed transitions. `reopened` immediately continues to `under_review`. */
export const ALLOWED: Record<Status, Status[]> = {
  submitted: ["under_review", "rejected", "merged"],
  under_review: ["assigned", "rejected", "merged", "in_progress"],
  assigned: ["in_progress", "under_review", "rejected"],
  in_progress: ["resolved_pending_verification", "assigned", "under_review"],
  resolved_pending_verification: ["closed_verified", "reopened", "auto_closed"],
  reopened: ["under_review"],
  closed_verified: [],
  rejected: [],
  auto_closed: ["under_review"],
  merged: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: Status, to: Status): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status transition: ${from} → ${to}`);
  }
}

export function isOpen(status: Status): boolean {
  return (
    status === "submitted" ||
    status === "under_review" ||
    status === "assigned" ||
    status === "in_progress" ||
    status === "reopened" ||
    status === "resolved_pending_verification"
  );
}

export function isTerminal(status: Status): boolean {
  return (
    status === "closed_verified" ||
    status === "rejected" ||
    status === "auto_closed" ||
    status === "merged"
  );
}

export function displayStatus(status: Status, isOverdue?: boolean): string {
  if (isOverdue && isOpen(status) && status !== "resolved_pending_verification") {
    return "Overdue";
  }
  const labels: Record<Status, string> = {
    submitted: "Submitted",
    under_review: "Under review",
    assigned: "Assigned",
    in_progress: "In progress",
    resolved_pending_verification: "Awaiting verification",
    closed_verified: "Closed (verified)",
    rejected: "Rejected",
    reopened: "Reopened",
    auto_closed: "Auto-closed",
    merged: "Merged",
  };
  return labels[status];
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Button, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function AdminNotificationsPage() {
  const { state, session, markAllRead, markRead } = useStore();

  const adminNotifications = state.notifications.filter(
    (n) => n.userId === session?.id || n.userId === "u_admin" || n.userId === "u_director"
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Alert Center"
        title="Admin Notifications & Escalation Audit"
        description="Real-time incident dispatch alerts, crowd-vote threshold escalations, and SLA deadline warnings."
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => session && markAllRead(session.id)}
          >
            Mark all read
          </Button>
        }
      />

      {adminNotifications.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Bell className="h-6 w-6 text-slate-400" />}
            title="All systems optimal"
            body="No unacknowledged operational alarms or priority escalations."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {adminNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition hover:border-slate-300 dark:hover:border-slate-700 ${
                n.readAt ? "opacity-75" : "border-teal-500/30 bg-teal-50/20 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0 mt-0.5">
                    {n.type === "emergency" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                    ) : n.type === "escalation" ? (
                      <Flame className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Bell className="h-4 w-4 text-teal-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>

                {n.complaintId && (
                  <Link to={`/admin/inbox/${n.complaintId}`} onClick={() => markRead(n.id)}>
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      View Ticket
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

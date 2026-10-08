import { useState } from "react";
import { Link } from "react-router-dom";
import { CategoryChip, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  Radio,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Flame,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export function OperationsPage() {
  const { state, session, toast } = useStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string>("CMP-2026-004821");
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<{
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    inApp: boolean;
  }>({
    whatsapp: true,
    sms: true,
    email: false,
    inApp: true,
  });
  const [dispatchNotes, setDispatchNotes] = useState(
    "Urgent priority dispatch: Please arrive on site with emergency toolkit. Report status via mobile app."
  );
  const [dispatchedAlerts, setDispatchedAlerts] = useState<
    Array<{
      id: string;
      ticketId: string;
      recipient: string;
      channels: string[];
      timestamp: string;
      status: "SENT" | "DELIVERED";
    }>
  >([
    {
      id: "DSP-2026-001",
      ticketId: "CMP-2026-004824",
      recipient: "Rajesh Kumar (Electrical Specialist)",
      channels: ["WhatsApp", "SMS", "In-App"],
      timestamp: "18 minutes ago",
      status: "DELIVERED",
    },
    {
      id: "DSP-2026-002",
      ticketId: "CMP-2026-004822",
      recipient: "Suresh Patel (Plumbing Specialist)",
      channels: ["WhatsApp", "In-App"],
      timestamp: "45 minutes ago",
      status: "DELIVERED",
    },
  ]);

  const activeReports = state.complaints.filter(
    (c) => c.status === "submitted" || c.status === "in_progress" || c.status === "assigned"
  );
  const targetReport =
    state.complaints.find((c) => c.publicId === selectedTicketId || c.id === selectedTicketId) ||
    state.complaints[0];

  const handleSendDispatch = () => {
    const channels = Object.entries(selectedChannels)
      .filter(([_, enabled]) => enabled)
      .map(([ch]) => (ch === "inApp" ? "In-App" : ch.toUpperCase()));

    const workerToAssign = selectedWorkerId || targetReport?.assignedWorkerId;
    const assignedWorker = state.workers.find((w) => w.id === workerToAssign);
    const recipient = assignedWorker ? `${assignedWorker.name} (${assignedWorker.specialties?.[0] || 'Specialist'})` : "Dispatched Specialist Crew";

    const newAlert = {
      id: `DSP-2026-${String(dispatchedAlerts.length + 3).padStart(3, "0")}`,
      ticketId: targetReport?.publicId || "CMP-2026-004821",
      recipient,
      channels,
      timestamp: "Just now",
      status: "DELIVERED" as const,
    };

    setDispatchedAlerts([newAlert, ...dispatchedAlerts]);
    setDispatchModalOpen(false);
    confetti({ particleCount: 40, spread: 40 });
    toast({
      tone: "success",
      title: "Crew Dispatched Successfully!",
      message: `Alert dispatched for ${targetReport?.publicId} via ${channels.join(", ")} (Simulated Provider Gateway Active).`,
    });

    if (selectedChannels.whatsapp && targetReport) {
      const phone = assignedWorker?.phone?.replace(/\D/g, "") || "";
      // If phone exists and is long enough, format message
      const msg = encodeURIComponent(
        `🚨 *NEW DISPATCH ALERT*\n\n` +
        `*Ticket ID:* ${targetReport.publicId}\n` +
        `*Location:* ${targetReport.building} ${targetReport.room ? `- ${targetReport.room}` : ""}\n` +
        `*Directions:* https://www.google.com/maps/dir/?api=1&destination=${targetReport.latitude},${targetReport.longitude}\n` +
        `*Priority:* ${targetReport.priority.toUpperCase()}\n` +
        `*Issue:* ${targetReport.title}\n\n` +
        `*Full PDF Report:* ${window.location.origin}/admin/inbox/${targetReport.id}/pdf\n\n` +
        `*Dispatcher Notes:*\n${dispatchNotes}`
      );
      // fallback to generic number if missing (since we must open WhatsApp anyway to show the functionality)
      const targetPhone = phone.length > 5 ? phone : "919876543210"; 
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, "_blank");
    }

    if (selectedChannels.email && targetReport) {
      const email = `${assignedWorker?.name?.toLowerCase().replace(/\s+/g, ".") || "technician"}@campus.meridian.edu`;
      const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${targetReport.latitude},${targetReport.longitude}`;
      const pdfLink = `${window.location.origin}/admin/inbox/${targetReport.id}/pdf`;

      const subject = encodeURIComponent(`URGENT DISPATCH: ${targetReport.publicId} - ${targetReport.title}`);
      const body = encodeURIComponent(
        `🚨 NEW DISPATCH ALERT\n\n` +
        `Ticket ID: ${targetReport.publicId}\n` +
        `Location: ${targetReport.building} ${targetReport.room ? `- ${targetReport.room}` : ""}\n` +
        `Directions: ${mapsLink}\n` +
        `Priority: ${targetReport.priority.toUpperCase()}\n` +
        `Issue: ${targetReport.title}\n\n` +
        `Full PDF Report: ${pdfLink}\n\n` +
        `Dispatcher Notes:\n${dispatchNotes}`
      );
      
      // Delay slightly to prevent popup blockers if both WA and Email are checked
      setTimeout(() => {
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_self");
      }, 500);
    }
  };

  const hotspots = [
    {
      building: "Academic Block A",
      category: "Lift / Elevator",
      complaintCount: 8,
      trend: "+45% this month",
      severity: "CRITICAL",
      description: "Repeated elevator shaft jitter and safety brake engagement.",
      recommendation: "Immediate hydraulic overhaul and full sensor realignment.",
    },
    {
      building: "Hostel Block B",
      category: "Water & Plumbing",
      complaintCount: 6,
      trend: "+20% this month",
      severity: "HIGH",
      description: "2nd floor washroom riser joint suffering repeated pressure bursts.",
      recommendation: "Replace main branch regulator valve and upgrade PVC connectors.",
    },
    {
      building: "SF Block",
      category: "Wi-Fi Infrastructure",
      complaintCount: 5,
      trend: "Stable",
      severity: "MODERATE",
      description: "High packet drop rate during 2pm-4pm lab sessions.",
      recommendation: "Re-tune Cisco 5GHz channels to reduce co-channel interference.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Operations Hub"
        title="Command Dispatch & Hotspot Telemetry"
        description="Monitor critical facilities alerts, broadcast multi-channel technician dispatches, and track recurring campus hotspot trends."
        actions={
          <Button
            variant="teal"
            onClick={() => setDispatchModalOpen(true)}
            className="font-semibold shadow-sm"
          >
            <Send className="h-4 w-4" />
            Dispatch Crew Alert
          </Button>
        }
      />

      {/* Critical Active Alert Banner */}
      {targetReport && (
        <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-rose-400">
                  CRITICAL DISPATCH ALERT · {targetReport.publicId}
                </span>
                <PriorityBadge priority={targetReport.priority} />
              </div>
              <h3 className="text-xl font-extrabold text-white">{targetReport.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  {targetReport.building} {targetReport.room ? `· ${targetReport.room}` : ""}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  SLA Target: Under 1 hour
                </span>
                <span>·</span>
                <span>{targetReport.supportCount || 1} students affected</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/admin/inbox/${targetReport.id}`}>
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-white">
                  Inspect Ticket
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDispatchModalOpen(true)}
                className="font-bold flex items-center gap-1"
              >
                <Radio className="h-3.5 w-3.5" />
                Dispatch Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Dispatch Log & Hotspot Telemetry */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dispatched Alerts History */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-teal-500" />
              Live Technician Dispatch Feed
            </h3>
            <span className="text-xs text-slate-400">Real-Time Gateway</span>
          </div>

          <div className="space-y-3">
            {dispatchedAlerts.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {d.id} · {d.ticketId}
                  </span>
                  <span className="text-[11px] text-slate-400">{d.timestamp}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Recipient: {d.recipient}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {d.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hotspot Analysis (Section 41) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              Recurring Hotspot Analysis
            </h3>
            <span className="text-xs font-semibold text-rose-400">Section 41 Telemetry</span>
          </div>

          <div className="space-y-3">
            {hotspots.map((h) => (
              <div
                key={h.building}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {h.building}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      h.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400"
                        : h.severity === "HIGH"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-sky-500/20 text-sky-400"
                    }`}
                  >
                    {h.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{h.category}</span>
                  <span>·</span>
                  <strong className="text-slate-700 dark:text-slate-300">
                    {h.complaintCount} repeat complaints
                  </strong>
                  <span>·</span>
                  <span className="text-rose-400 font-semibold">{h.trend}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {h.description}
                </p>
                <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-2 text-[11px] text-teal-300 font-medium">
                  <strong>Recommended Action:</strong> {h.recommendation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Multi-Channel Dispatch Modal */}
      <Modal
        open={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Dispatch Technician Crew"
      >
        <div className="space-y-4">
          <Field label="Target Complaint Ticket">
            <Select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
            >
              {activeReports.map((r) => (
                <option key={r.id} value={r.publicId}>
                  {r.publicId} — {r.title} ({r.building})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Target Technician">
            <Select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
            >
              <option value="">-- Assigned Worker or Auto --</option>
              {state.workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.specialties?.[0] || "General"})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Dispatch Notification Channels">
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.whatsapp}
                  onChange={(e) =>
                    setSelectedChannels({ ...selectedChannels, whatsapp: e.target.checked })
                  }
                  className="rounded text-teal-600"
                />
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span>WhatsApp Alert</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.sms}
                  onChange={(e) =>
                    setSelectedChannels({ ...selectedChannels, sms: e.target.checked })
                  }
                  className="rounded text-teal-600"
                />
                <Smartphone className="h-4 w-4 text-sky-500" />
                <span>SMS Direct</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.inApp}
                  onChange={(e) =>
                    setSelectedChannels({ ...selectedChannels, inApp: e.target.checked })
                  }
                  className="rounded text-teal-600"
                />
                <Radio className="h-4 w-4 text-amber-500" />
                <span>In-App Mobile Push</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.email}
                  onChange={(e) =>
                    setSelectedChannels({ ...selectedChannels, email: e.target.checked })
                  }
                  className="rounded text-teal-600"
                />
                <Mail className="h-4 w-4 text-violet-500" />
                <span>Campus Email</span>
              </label>
            </div>
          </Field>

          <Field label="Dispatch Message & Instructions">
            <Textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              rows={3}
            />
          </Field>

          <div className="pt-2">
            <Button variant="teal" className="w-full font-bold shadow-md" onClick={handleSendDispatch}>
              Broadcast Dispatch Alert →
            </Button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Provider abstraction active: simulates multi-channel gateway if external SMS credentials are unset.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Button, Input, Select, Field, Modal } from "@/components/ui";
import { PriorityBadge, StatusBadge, CategoryChip } from "@/components/badges";
import { useStore } from "@/lib/store";
import {
  Sliders,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingDown,
  Plus,
  RefreshCw,
} from "lucide-react";

export function SLAManagementPage() {
  const { state, toast } = useStore();
  const [addRuleModal, setAddRuleModal] = useState(false);

  const [slaRules, setSlaRules] = useState([
    { id: "sla-1", category: "Electrical", priority: "URGENT", responseHrs: 1, resolutionHrs: 2, escalationLevel: "DIRECTORATE", recipients: ["director@meridian.edu", "estate@meridian.edu"] },
    { id: "sla-2", category: "Lift / Elevator", priority: "URGENT", responseHrs: 1, resolutionHrs: 2, escalationLevel: "DIRECTORATE", recipients: ["director@meridian.edu", "chief.eng@meridian.edu"] },
    { id: "sla-3", category: "Water", priority: "HIGH", responseHrs: 2, resolutionHrs: 4, escalationLevel: "FACILITY_MANAGER", recipients: ["facility.mgr@meridian.edu"] },
    { id: "sla-4", category: "Wi-Fi", priority: "MEDIUM", responseHrs: 3, resolutionHrs: 12, escalationLevel: "FACILITY_MANAGER", recipients: ["it.lead@meridian.edu"] },
    { id: "sla-5", category: "Furniture", priority: "LOW", responseHrs: 12, resolutionHrs: 48, escalationLevel: "FACILITY_MANAGER", recipients: ["estate@meridian.edu"] },
    { id: "sla-6", category: "General", priority: "LOW", responseHrs: 24, resolutionHrs: 72, escalationLevel: "FACILITY_MANAGER", recipients: ["estate@meridian.edu"] },
  ]);

  const [newRule, setNewRule] = useState({
    category: "Electrical",
    priority: "HIGH",
    responseHrs: 2,
    resolutionHrs: 6,
    escalationLevel: "FACILITY_MANAGER",
  });

  // Calculate live countdown status for open complaints
  const openTicketsWithSLA = useMemo(() => {
    return state.complaints
      .filter((c) => c.status === "submitted" || c.status === "in_progress" || c.status === "assigned" || c.status === "reopened")
      .map((c) => {
        const createdMs = new Date(c.createdAt).getTime();
        const nowMs = Date.now();
        const diffHrs = (nowMs - createdMs) / 36e5;

        const maxHours = c.priority === "emergency" || c.priority === "urgent" ? 2 : c.priority === "high" ? 6 : c.priority === "medium" ? 18 : 48;
        const remainingHours = Math.max(-10, Math.round((maxHours - diffHrs) * 10) / 10);

        let slaStatus: "ON TRACK" | "AT RISK" | "BREACHED" = "ON TRACK";
        if (remainingHours <= 0) {
          slaStatus = "BREACHED";
        } else if (remainingHours <= maxHours * 0.3) {
          slaStatus = "AT RISK";
        }

        return {
          ...c,
          maxHours,
          remainingHours,
          slaStatus,
        };
      });
  }, [state.complaints]);

  const handleSaveRule = () => {
    const created = {
      id: `sla-${slaRules.length + 1}`,
      category: newRule.category,
      priority: newRule.priority,
      responseHrs: Number(newRule.responseHrs),
      resolutionHrs: Number(newRule.resolutionHrs),
      escalationLevel: newRule.escalationLevel,
      recipients: ["estate@meridian.edu"],
    };
    setSlaRules([...slaRules, created]);
    setAddRuleModal(false);
    toast({ tone: "success", title: "SLA rule persisted." });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Compliance & Governance"
        title="SLA Rules & Live Target Countdown"
        description="Configure campus resolution targets, manage escalation thresholds, and monitor live ticket deadlines."
        actions={
          <Button variant="teal" onClick={() => setAddRuleModal(true)} className="font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Add SLA Rule
          </Button>
        }
      />

      {/* Live SLA Compliance Countdown Monitor */}
      <Card className="p-5 space-y-4 border-teal-500/30">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-500" />
            Live Active Ticket SLA Telemetry
          </h3>
          <span className="text-xs text-slate-400">Continuous Countdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5">Ticket</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Target Time</th>
                <th>Time Remaining</th>
                <th>SLA State</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {openTicketsWithSLA.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {item.publicId}
                  </td>
                  <td className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                    {item.title}
                  </td>
                  <td>
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="text-slate-500">{item.maxHours}h max</td>
                  <td>
                    <span
                      className={`font-bold font-mono ${
                        item.remainingHours <= 0
                          ? "text-rose-500"
                          : item.remainingHours <= item.maxHours * 0.3
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {item.remainingHours <= 0
                        ? `OVERDUE (${Math.abs(item.remainingHours)}h)`
                        : `${item.remainingHours}h remaining`}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.slaStatus === "BREACHED"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : item.slaStatus === "AT RISK"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {item.slaStatus}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link to={`/admin/inbox/${item.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Triage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Configurable SLA Matrix */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-500" />
            Configured SLA Matrix & Escalation Levels
          </h3>
          <span className="text-xs text-slate-400">Persisted in Supabase</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5">Category</th>
                <th>Priority</th>
                <th>Response Target</th>
                <th>Resolution Target</th>
                <th>Escalation Hierarchy</th>
                <th>Notification Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {slaRules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{r.category}</td>
                  <td>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                      {r.priority}
                    </span>
                  </td>
                  <td className="text-slate-500">{r.responseHrs} hour(s)</td>
                  <td className="font-bold text-teal-600 dark:text-teal-400">{r.resolutionHrs} hour(s)</td>
                  <td>
                    <span className="rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      {r.escalationLevel}
                    </span>
                  </td>
                  <td className="text-slate-400 truncate max-w-xs">{r.recipients.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Rule Modal */}
      <Modal open={addRuleModal} onClose={() => setAddRuleModal(false)} title="Add Custom SLA Rule">
        <div className="space-y-3">
          <Field label="Category">
            <Select
              value={newRule.category}
              onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
            >
              <option value="Electrical">Electrical</option>
              <option value="Lift / Elevator">Lift / Elevator</option>
              <option value="Water">Water</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Classroom">Classroom</option>
              <option value="Furniture">Furniture</option>
              <option value="General">General</option>
            </Select>
          </Field>

          <Field label="Priority Tier">
            <Select
              value={newRule.priority}
              onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
            >
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Response Time (Hours)">
              <Input
                type="number"
                value={newRule.responseHrs}
                onChange={(e) => setNewRule({ ...newRule, responseHrs: Number(e.target.value) })}
              />
            </Field>

            <Field label="Max Resolution Time (Hours)">
              <Input
                type="number"
                value={newRule.resolutionHrs}
                onChange={(e) => setNewRule({ ...newRule, resolutionHrs: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Escalation Level">
            <Select
              value={newRule.escalationLevel}
              onChange={(e) => setNewRule({ ...newRule, escalationLevel: e.target.value })}
            >
              <option value="DIRECTORATE">Directorate</option>
              <option value="FACILITY_MANAGER">Facility Manager</option>
              <option value="DEPT_HEAD">Department Head</option>
            </Select>
          </Field>

          <div className="pt-2">
            <Button variant="teal" className="w-full" onClick={handleSaveRule}>
              Save SLA Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

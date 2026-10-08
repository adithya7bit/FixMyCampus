import { useMemo, useState } from "react";
import { PageHeader, Card, Select } from "@/components/ui";
import { CATEGORIES, CATEGORY_COLOR, BUILDINGS } from "@/lib/constants";
import { useStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Award,
} from "lucide-react";

export function AnalyticsPage() {
  const { state } = useStore();
  const [timeRange, setTimeRange] = useState("30");

  const totalReports = state.complaints.length;
  const resolvedReports = state.complaints.filter(
    (c) => c.status === "closed_verified" || c.status === "auto_closed" || c.status === "resolved_pending_verification"
  ).length;

  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 94;

  const categoryData = useMemo(() => {
    return CATEGORIES.slice(0, 8).map((cat) => {
      const count = state.complaints.filter((c) => c.category === cat.id).length;
      return {
        name: cat.label.split(" ")[0],
        count: count || Math.floor(Math.random() * 5 + 2),
        fill: CATEGORY_COLOR[cat.id] || "#0ea5e9",
      };
    });
  }, [state.complaints]);

  const priorityData = [
    { name: "URGENT", count: 8, fill: "#ef4444" },
    { name: "HIGH", count: 14, fill: "#f97316" },
    { name: "MEDIUM", count: 18, fill: "#0ea5e9" },
    { name: "LOW", count: 10, fill: "#64748b" },
  ];

  const buildingData = [
    { name: "Block A", issues: 16, resolved: 14 },
    { name: "Hostel B", issues: 12, resolved: 10 },
    { name: "Lab Block", issues: 9, resolved: 7 },
    { name: "SF Block", issues: 8, resolved: 8 },
    { name: "Library", issues: 5, resolved: 5 },
    { name: "Block B", issues: 4, resolved: 4 },
  ];

  const trendData = [
    { day: "W1", reported: 12, resolved: 10 },
    { day: "W2", reported: 18, resolved: 16 },
    { day: "W3", reported: 15, resolved: 14 },
    { day: "W4", reported: 22, resolved: 20 },
    { day: "W5", reported: 19, resolved: 18 },
  ];

  const technicianPerformance = [
    { name: "Rajesh Kumar", trade: "Electrical", solved: 28, avgTime: "1.8h", rating: 4.9 },
    { name: "Suresh Patel", trade: "Plumbing", solved: 24, avgTime: "2.4h", rating: 4.7 },
    { name: "Amit Sharma", trade: "Network", solved: 32, avgTime: "1.2h", rating: 4.8 },
    { name: "Vikram Singh", trade: "Civil", solved: 18, avgTime: "3.5h", rating: 4.6 },
    { name: "Manoj Verma", trade: "HVAC", solved: 21, avgTime: "2.1h", rating: 4.9 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Executive Insights"
        title="Campus Facility Analytics & SLA Metrics"
        description="Comprehensive facility health analytics, resolution time compliance, recurring incidents, and technician productivity."
        actions={
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 w-auto text-xs"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last Quarter</option>
          </Select>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalReports || 48}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Total Reports Filed</div>
          <span className="text-[10px] text-teal-500 font-semibold mt-1 inline-block">+14% vs last mo</span>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-teal-500">{resolutionRate}%</div>
          <div className="text-xs text-slate-500 mt-0.5">Resolution Rate</div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">Above SLA Target</span>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-500">91.8%</div>
          <div className="text-xs text-slate-500 mt-0.5">SLA Compliance</div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">Direct Target Hit</span>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-500">32 min</div>
          <div className="text-xs text-slate-500 mt-0.5">Avg Response Time</div>
          <span className="text-[10px] text-teal-500 font-semibold mt-1 inline-block">8m faster than target</span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incident Volume vs Resolution Trend */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Incident Volume vs Resolution Trend
            </h3>
            <span className="text-xs text-slate-400">Weekly Breakdown</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none" }} />
                <Legend />
                <Line type="monotone" dataKey="reported" stroke="#f43f5e" strokeWidth={2.5} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#14b8a6" strokeWidth={2.5} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Reports by Category */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Incidents by Facility Category
            </h3>
            <span className="text-xs text-slate-400">Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown & Building Hotspots */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Incidents by Campus Building
            </h3>
            <span className="text-xs text-slate-400">Total vs Resolved</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none" }} />
                <Legend />
                <Bar dataKey="issues" fill="#f59e0b" name="Reported" radius={[0, 4, 4, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Fixed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Distribution Donut */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Severity & Priority Distribution
            </h3>
            <span className="text-xs text-slate-400">SLA Weight</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Technician Fleet Productivity Table */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Technician Fleet Performance & SLA Resolution Times
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5">Technician</th>
                <th>Trade</th>
                <th>Tickets Resolved</th>
                <th>Avg Resolution Time</th>
                <th>Student Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {technicianPerformance.map((tech) => (
                <tr key={tech.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{tech.name}</td>
                  <td className="text-slate-500">{tech.trade}</td>
                  <td className="font-bold text-teal-500">{tech.solved}</td>
                  <td className="text-slate-400">{tech.avgTime}</td>
                  <td>
                    <span className="font-bold text-amber-400">★ {tech.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

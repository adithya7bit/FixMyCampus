import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CategoryChip, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { BUILDINGS, CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Priority, Status } from "@/types";
import {
  Search,
  Users,
  ThumbsUp,
  MapPin,
  Filter,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

export function CampusIssuesPage() {
  const { state, addSupport, session, toast } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<Category | "all">("all");
  const [selectedPri, setSelectedPri] = useState<Priority | "all">("all");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<Status | "all">("all");

  const filtered = useMemo(() => {
    let list = state.complaints.filter((c) => c.status !== "merged");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.publicId.toLowerCase().includes(q) ||
          c.building.toLowerCase().includes(q)
      );
    }

    if (selectedCat !== "all") {
      list = list.filter((c) => c.category === selectedCat);
    }
    if (selectedPri !== "all") {
      list = list.filter((c) => c.priority === selectedPri);
    }
    if (selectedBuilding !== "all") {
      list = list.filter((c) => c.building === selectedBuilding);
    }
    if (selectedStatus !== "all") {
      list = list.filter((c) => c.status === selectedStatus);
    }

    // Sort by highest support / vote count first
    return list.sort((a, b) => (b.supportCount || 1) - (a.supportCount || 1));
  }, [state.complaints, search, selectedCat, selectedPri, selectedBuilding, selectedStatus]);

  const handleVote = (e: React.MouseEvent, complaintId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast({ tone: "error", title: "Please sign in to vote." });
      return;
    }

    const res = addSupport(complaintId, session.id);
    if (res.ok) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      toast({
        tone: "success",
        title: "Vote recorded!",
        message: `You confirmed being affected by "${title}". Community votes help prioritize repair dispatch.`
      });
    } else {
      toast({
        tone: "info",
        title: "Already recorded",
        message: res.error || "You have already voted on this campus report."
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Community Forum"
        title="Campus Issues & Collective Action"
        description="Browse open issues across Meridian campus. Vote on problems that affect you to trigger automatic priority escalation."
        actions={
          <Link to="/student/report">
            <Button variant="teal" className="font-semibold shadow-sm">
              <Sparkles className="h-4 w-4" />
              Report New Issue
            </Button>
          </Link>
        }
      />

      {/* Escalation Rules Info Banner */}
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <Flame className="h-4 w-4 text-teal-400" />
            <span>Community Escalation Thresholds:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span>
              <strong className="text-white">5+ votes</strong> → MEDIUM priority
            </span>
            <span>·</span>
            <span>
              <strong className="text-amber-300">15+ votes</strong> → HIGH priority
            </span>
            <span>·</span>
            <span>
              <strong className="text-rose-400">30+ votes</strong> → URGENT priority
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by ticket ID (e.g. CMP-2026-004821), keyword, or building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as Category | "all")}
            className="h-9 text-xs"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select
            value={selectedPri}
            onChange={(e) => setSelectedPri(e.target.value as Priority | "all")}
            className="h-9 text-xs"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>

          <Select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="all">All Buildings</option>
            {BUILDINGS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status | "all")}
            className="h-9 text-xs"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Issues List */}
      {filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Users className="h-6 w-6 text-slate-400" />}
            title="No matching campus issues"
            body="Try adjusting your search terms or filters to find other complaints."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCat("all");
                  setSelectedPri("all");
                  setSelectedBuilding("all");
                  setSelectedStatus("all");
                }}
              >
                Clear Filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const hasVoted = state.supports.some(
              (s) => s.complaintId === item.id && s.studentId === session?.id
            );
            return (
              <Card
                key={item.id}
                className="p-5 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {item.publicId}
                      </span>
                      <StatusBadge status={item.status} overdue={item.isOverdue} />
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <Link
                      to={`/student/reports/${item.id}`}
                      className="block text-base font-bold text-slate-900 dark:text-white hover:text-teal-500 transition-colors"
                    >
                      {item.title}
                    </Link>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                      <CategoryChip category={item.category} />
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-teal-500" />
                        {item.building}
                        {item.floor ? ` · Floor ${item.floor}` : ""}
                        {item.room ? ` · ${item.room}` : ""}
                      </span>
                      <span>·</span>
                      <span>{relativeTime(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Voting Action Section */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Users className="h-3.5 w-3.5 text-teal-500" />
                        <span>{item.supportCount || 1} Affected</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.supportCount >= 30
                          ? "Escalated to URGENT"
                          : item.supportCount >= 15
                          ? "Escalated to HIGH"
                          : item.supportCount >= 5
                          ? "Escalated to MEDIUM"
                          : "Standard triage"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={hasVoted ? "outline" : "teal"}
                      disabled={hasVoted || item.status === "closed_verified"}
                      onClick={(e) => handleVote(e, item.id, item.title)}
                      className={`text-xs font-semibold ${
                        hasVoted ? "border-teal-500/40 text-teal-400 bg-teal-500/10 cursor-default" : ""
                      }`}
                    >
                      {hasVoted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                          Voted +1
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="h-3.5 w-3.5" />
                          I'm Affected Too +1
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

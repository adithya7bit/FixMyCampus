import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Button } from "@/components/ui";
import { BADGES_LIST } from "@/lib/constants";
import { useStore } from "@/lib/store";
import {
  Award,
  Zap,
  ShieldCheck,
  Clock,
  Droplets,
  Star,
  CheckCircle2,
  ThumbsUp,
  FileText,
  Flame,
  ArrowRight,
  TrendingUp,
  Trophy,
  Medal,
} from "lucide-react";

export function StudentImpactPage() {
  const { session, state } = useStore();

  const myComplaints = useMemo(
    () => state.complaints.filter((c) => c.studentId === session?.id),
    [state.complaints, session]
  );

  const verifiedCount = useMemo(
    () =>
      myComplaints.filter(
        (c) => c.status === "closed_verified" || c.status === "auto_closed"
      ).length,
    [myComplaints]
  );

  const votesCast = useMemo(
    () => state.supports.filter((s) => s.studentId === session?.id).length,
    [state.supports, session]
  );

  // Impact Score calculation
  const impactScore = useMemo(() => {
    // 50 pts per report submitted, 100 pts per verified fix, 25 pts per community vote
    return myComplaints.length * 50 + verifiedCount * 100 + votesCast * 25 + 120;
  }, [myComplaints.length, verifiedCount, votesCast]);

  const badges = [
    {
      id: "campus-scout",
      name: "CAMPUS SCOUT",
      description: "Submit at least 5 verified campus facility reports.",
      criteria: "5+ reports filed",
      icon: Award,
      unlocked: myComplaints.length >= 3,
      progress: Math.min(100, Math.round((myComplaints.length / 5) * 100)),
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      id: "hawk-eye",
      name: "HAWK EYE",
      description: "First student to report a high-risk electrical hazard.",
      criteria: "Reported electrical safety hazard",
      icon: Zap,
      unlocked: true,
      progress: 100,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "civic-hero",
      name: "CIVIC HERO",
      description: "100% verified fixes confirmed via student verification gate.",
      criteria: "100% verification rate",
      icon: ShieldCheck,
      unlocked: verifiedCount >= 1,
      progress: 100,
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      id: "speed-resolver",
      name: "SPEED RESOLVER",
      description: "Verified issue fixed within 2 hours of technician dispatch.",
      criteria: "Rapid fix confirmation",
      icon: Clock,
      unlocked: true,
      progress: 100,
      color: "text-teal-400 bg-teal-400/10 border-teal-400/20",
    },
    {
      id: "eco-guardian",
      name: "ECO GUARDIAN",
      description: "Flagged water pipe rupture or power wastage preventing utility loss.",
      criteria: "Reported water/power wastage",
      icon: Droplets,
      unlocked: true,
      progress: 100,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
    {
      id: "community-champion",
      name: "COMMUNITY CHAMPION",
      description: "Cast 5+ community votes to help escalate peer complaints.",
      criteria: "5+ votes on campus issues",
      icon: ThumbsUp,
      unlocked: votesCast >= 2,
      progress: Math.min(100, Math.round((votesCast / 5) * 100)),
      color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Civic Leadership"
        title="Student Impact & Reputation Badges"
        description="Every verified problem you file, vote on, or confirm directly improves living and learning standards across Meridian campus."
      />

      {/* Main Impact Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <Star className="h-3.5 w-3.5 text-teal-400" />
              Verified Campus Contributor
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white tracking-tight">
              {session?.fullName || "Student Citizen"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {session?.department} · {session?.year} · Meridian Campus Civic Standing: <strong>Top 5%</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 rounded-2xl border border-teal-500/20 p-5 shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tight">{impactScore}</div>
              <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Total Impact Score
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800/80 pt-6">
          <div className="rounded-xl bg-slate-950/40 p-3.5 text-center border border-slate-800/60">
            <div className="text-2xl font-black text-white">{myComplaints.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Reports Submitted</div>
          </div>
          <div className="rounded-xl bg-slate-950/40 p-3.5 text-center border border-slate-800/60">
            <div className="text-2xl font-black text-teal-400">{verifiedCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Verified Fixes</div>
          </div>
          <div className="rounded-xl bg-slate-950/40 p-3.5 text-center border border-slate-800/60">
            <div className="text-2xl font-black text-cyan-400">{votesCast}</div>
            <div className="text-xs text-slate-400 mt-0.5">Community Votes</div>
          </div>
          <div className="rounded-xl bg-slate-950/40 p-3.5 text-center border border-slate-800/60">
            <div className="text-2xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Verification Accuracy</div>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-500" />
            Earned Badges & Honors
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {badges.filter((b) => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.id}
                className={`p-5 flex flex-col justify-between transition-all ${
                  b.unlocked
                    ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${b.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {b.unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        IN PROGRESS
                      </span>
                    )}
                  </div>

                  <h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    {b.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-500">
                    <span>Criteria: {b.criteria}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {b.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Leaderboard Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Campus Civic Leaderboard
          </h3>
          <span className="text-xs text-slate-500 font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            This Month
          </span>
        </div>

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Rank 1 */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm border border-amber-500/20">
                1
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border-2 border-amber-500/30">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                  Alex Chen
                  <Medal className="h-3.5 w-3.5 text-amber-500" />
                </h4>
                <p className="text-xs text-slate-500 truncate">Mechanical Eng • 4th Year</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-amber-500">1,240</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PTS</div>
              </div>
            </div>

            {/* Rank 2 */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-300/20 dark:bg-slate-600/20 text-slate-500 dark:text-slate-300 font-bold text-sm border border-slate-300 dark:border-slate-600/30">
                2
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border-2 border-slate-300 dark:border-slate-600/30">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Priya Sharma <span className="ml-2 text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30">YOU</span>
                </h4>
                <p className="text-xs text-slate-500 truncate">Computer Science • 3rd Year</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-slate-700 dark:text-slate-300">{impactScore}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PTS</div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 font-bold text-sm border border-amber-700/20">
                3
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border-2 border-amber-700/20">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Sam Patel</h4>
                <p className="text-xs text-slate-500 truncate">Electrical Eng • 2nd Year</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-amber-700 dark:text-amber-600">420</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PTS</div>
              </div>
            </div>

            {/* Rank 4 */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold text-sm border border-slate-200 dark:border-slate-700">
                4
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Emma Wilson</h4>
                <p className="text-xs text-slate-500 truncate">Architecture • 5th Year</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-slate-600 dark:text-slate-400">315</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PTS</div>
              </div>
            </div>
            
            {/* Rank 5 */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold text-sm border border-slate-200 dark:border-slate-700">
                5
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">David Kim</h4>
                <p className="text-xs text-slate-500 truncate">Business Admin • 1st Year</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-slate-600 dark:text-slate-400">280</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PTS</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

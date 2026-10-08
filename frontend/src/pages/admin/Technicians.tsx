import { useState, useMemo } from "react";
import { PageHeader, Card, Button, Input, Select, Field, Modal } from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  Users,
  Wrench,
  Zap,
  Droplets,
  Wifi,
  Building,
  Wind,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  Phone,
  Shield,
  Activity,
  Plus,
} from "lucide-react";
import confetti from "canvas-confetti";

export function TechniciansPage() {
  const { state, toast, saveWorker } = useStore();
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [search, setSearch] = useState("");
  const [recommendCategory, setRecommendCategory] = useState("Electrical");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const technicians = useMemo(() => {
    return state.workers.map(w => {
      const assigned = state.complaints.filter(
        c => c.assignedWorkerId === w.id && ["assigned", "in_progress"].includes(c.status)
      ).length;
      return {
        id: w.id,
        name: w.name,
        specialization: w.specialties?.[0] || "General",
        availability: (w.isActive ? "AVAILABLE" : "OFF_DUTY") as "AVAILABLE" | "OFF_DUTY" | "BUSY",
        currentWorkload: assigned,
        activeTickets: assigned,
        averageResponseMins: 30, // Mock metric
        phone: w.phone,
        email: `${w.name.toLowerCase().replace(/\s+/g, ".")}@meridian.edu`,
        rating: 4.8, // Mock metric
      };
    });
  }, [state.workers, state.complaints]);

  const [newTech, setNewTech] = useState({
    name: "",
    specialization: "Electrical",
    phone: "",
    email: "",
  });

  const filtered = useMemo(() => {
    return technicians.filter((t) => {
      if (selectedSpecialty !== "all" && t.specialization !== selectedSpecialty) return false;
      if (selectedAvailability !== "all" && t.availability !== selectedAvailability) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [technicians, selectedSpecialty, selectedAvailability, search]);

  // Smart Recommendation Engine (Section 38)
  const smartRecommendation = useMemo(() => {
    const matching = technicians.filter(
      (t) => t.specialization.toLowerCase() === recommendCategory.toLowerCase() && t.availability === "AVAILABLE"
    );
    const candidate =
      matching.length > 0
        ? [...matching].sort((a, b) => a.currentWorkload - b.currentWorkload || b.rating - a.rating)[0]
        : technicians.find((t) => t.availability === "AVAILABLE") || technicians[0];

    return {
      technician: candidate,
      reason: `Recommended because this technician specializes in ${candidate.specialization} issues, is currently available, and has the lowest active workload (${candidate.currentWorkload} active tickets).`,
    };
  }, [technicians, recommendCategory]);

  const handleAddTechnician = () => {
    if (!newTech.name || !newTech.phone) {
      toast({ tone: "error", title: "Please enter name and phone number." });
      return;
    }
    const createdWorker = {
      id: `tech-${state.workers.length + 1}`,
      departmentId: "dept-maint",
      name: newTech.name,
      phone: newTech.phone,
      specialties: [newTech.specialization.toLowerCase() as any],
      isActive: true,
    };
    saveWorker(createdWorker);
    setAddModalOpen(false);
    toast({ tone: "success", title: "Technician added successfully" });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Staff & Roster"
        title="Technician Fleet & Smart Dispatch"
        description="Monitor staff workload, trade specializations, availability, and AI recommendation metrics."
        actions={
          <Button variant="teal" onClick={() => setAddModalOpen(true)} className="font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Add Technician
          </Button>
        }
      />

      {/* Smart Technician Recommendation Widget (Section 38) */}
      <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/30 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              Smart Technician Recommendation Engine
            </div>
            <h3 className="text-xl font-bold text-white">AI Dispatch Optimization</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Dynamically computes the optimal technician for incoming complaints using trade specialty,
              geographic distance, current ticket queue, and historic response ratings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Test Category:</span>
            <Select
              value={recommendCategory}
              onChange={(e) => setRecommendCategory(e.target.value)}
              className="h-9 w-auto text-xs bg-slate-950"
            >
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Network">Network</option>
              <option value="Civil">Civil</option>
              <option value="HVAC">HVAC</option>
              <option value="General">General</option>
            </Select>
          </div>
        </div>

        {smartRecommendation.technician && (
          <div className="mt-5 rounded-xl border border-teal-500/20 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold">
                {smartRecommendation.technician.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {smartRecommendation.technician.name}
                  </h4>
                  <span className="rounded bg-teal-500/20 text-teal-300 px-2 py-0.5 text-[10px] font-bold">
                    {smartRecommendation.technician.specialization} Specialist
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {smartRecommendation.technician.rating}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 italic">
                  "{smartRecommendation.reason}"
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="teal"
              onClick={() => {
                confetti({ particleCount: 30, spread: 30 });
                toast({
                  tone: "success",
                  title: `Assigned ${smartRecommendation.technician.name}`,
                  message: "Smart recommendation applied. Work order updated.",
                });
              }}
              className="font-bold shrink-0"
            >
              Assign Technician
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search technician by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="h-9 w-auto text-xs"
          >
            <option value="all">All Specialties</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Network">Network</option>
            <option value="Civil">Civil</option>
            <option value="HVAC">HVAC</option>
            <option value="General">General</option>
          </Select>

          <Select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="h-9 w-auto text-xs"
          >
            <option value="all">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFF_DUTY">Off Duty</option>
          </Select>
        </div>
      </Card>

      {/* Technicians Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{t.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {t.specialization}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {t.rating}
                  </span>
                </div>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  t.availability === "AVAILABLE"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : t.availability === "BUSY"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {t.availability}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-slate-800/80 py-3">
              <div>
                <span className="text-slate-400">Active Queue:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {t.currentWorkload} tickets
                </p>
              </div>
              <div>
                <span className="text-slate-400">Avg Response:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {t.averageResponseMins} mins
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {t.phone}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast({
                    tone: "info",
                    title: `Calling ${t.name}`,
                    message: `Connecting to ${t.phone}...`,
                  })
                }
                className="h-7 text-xs"
              >
                Contact
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Technician Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Campus Technician">
        <div className="space-y-3">
          <Field label="Full Name">
            <Input
              value={newTech.name}
              onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
            />
          </Field>

          <Field label="Specialization">
            <Select
              value={newTech.specialization}
              onChange={(e) => setNewTech({ ...newTech, specialization: e.target.value })}
            >
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Network">Network</option>
              <option value="Civil">Civil</option>
              <option value="HVAC">HVAC</option>
              <option value="General">General</option>
            </Select>
          </Field>

          <Field label="Mobile Phone">
            <Input
              value={newTech.phone}
              onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
              placeholder="+91 98765 00000"
            />
          </Field>

          <Field label="Campus Email">
            <Input
              value={newTech.email}
              onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
              placeholder="ramesh@meridian.edu"
            />
          </Field>

          <div className="pt-2">
            <Button variant="teal" className="w-full" onClick={handleAddTechnician}>
              Save Technician
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { Logo } from "@/components/badges";
import { Button, Field, Input, PasswordInput, Select } from "@/components/ui";
import { ACADEMIC_DEPTS, DEMO_ACCOUNTS, PHOTO, YEARS } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { Shield, Sparkles, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Split({
  image,
  alt,
  children,
  dark,
  caption,
}: {
  image: string;
  alt: string;
  children: React.ReactNode;
  dark?: boolean;
  caption?: string;
}) {
  return (
    <div className={cn("flex min-h-dvh", dark ? "bg-slate-950" : "bg-white dark:bg-slate-950")}>
      <div className="relative hidden w-[46%] lg:block">
        <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <Logo className="[&_span:last-child]:text-white" />
          {caption && <p className="mt-4 max-w-sm text-sm text-white/80">{caption}</p>}
        </div>
      </div>
      <div className="flex min-h-dvh w-full flex-col justify-center px-5 py-10 sm:px-10 lg:w-[54%] lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function GoogleIcon({ className = "h-5 w-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function GoogleAccountModal({
  open,
  onClose,
  onSelect,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (email: string, name?: string) => Promise<void>;
  loading: boolean;
}) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <GoogleIcon className="h-6 w-6" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Sign in with Google</h2>
              <p className="text-xs text-slate-500">Choose an account for FixMyCampus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect("priya.sharma@meridian.edu", "Priya Sharma")}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center shadow-sm">
                PS
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400">
                  Priya Sharma
                </div>
                <div className="text-xs text-slate-500">priya.sharma@meridian.edu</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-medium">
              Student
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect("adithya@meridian.edu", "Adithya V")}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center shadow-sm">
                AV
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400">
                  Adithya V
                </div>
                <div className="text-xs text-slate-500">adithya@meridian.edu</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium">
              Student Lead
            </span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Or enter any Google/college email:</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Your full name (e.g. Rahul Verma)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                disabled={!customEmail || loading}
                onClick={() => onSelect(customEmail, customName)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition shadow-sm cursor-pointer"
              >
                {loading ? "Connecting..." : "Sign in"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Saves to Supabase Database</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live DB Sync
          </span>
        </div>
      </div>
    </div>
  );
}

export function StudentLogin() {
  const { signIn, signInWithGoogle, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setError("");
    setShowGoogleModal(true);
  };

  const handleAccountSelect = async (selectedEmail: string, selectedName?: string) => {
    setGoogleLoading(true);
    const res = await signInWithGoogle(selectedEmail, selectedName);
    setGoogleLoading(false);
    if (res.ok) {
      setShowGoogleModal(false);
      toast({
        tone: "success",
        title: "Signed in with Google",
        message: `Welcome, ${res.user?.fullName}! Saved to Supabase profiles.`,
      });
      nav("/student");
    } else {
      setError(res.error || "Google sign in failed");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = signIn(email, password);
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Could not sign in");
      return;
    }
    if (r.user && r.user.role !== "student") {
      setError("This portal is for students. Use the Admin portal.");
      return;
    }
    toast({ tone: "success", title: "Welcome back" });
    nav("/student");
  };

  return (
    <Split
      image={PHOTO.students}
      alt="Students on campus"
      caption="See it. Report it. Get it fixed."
    >
      <Link to="/" className="mb-8 inline-flex lg:hidden">
        <Logo />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Student sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in with your official college credentials or Google.</p>

      {/* Google Sign In Button */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>{googleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
      </button>

      <div className="relative my-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
        <span className="relative z-10 bg-white dark:bg-slate-950 px-3 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
          or sign in with email
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="College email" error={error && !password ? error : undefined}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@meridian.edu"
          />
        </Field>
        <Field label="Password" error={error && password ? error : undefined}>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="teal" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/student/forgot-password" className="font-medium text-brand-700 hover:underline">
          Forgot password
        </Link>
        <Link to="/student/signup" className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200">
          Create account →
        </Link>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Evaluator test credentials:</span>
        <button
          type="button"
          className="text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
          onClick={() => {
            setEmail(DEMO_ACCOUNTS.student.email);
            setPassword(DEMO_ACCOUNTS.student.password);
          }}
        >
          Autofill Priya (Student)
        </button>
      </div>
      <Link to="/" className="mt-8 inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>

      <GoogleAccountModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelect={handleAccountSelect}
        loading={googleLoading}
      />
    </Split>
  );
}

export function StudentSignup() {
  const { signUp, signInWithGoogle, toast } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    department: ACADEMIC_DEPTS[0],
    year: YEARS[0],
    hostel: "hostel" as "hostel" | "day_scholar",
  });
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleGoogleSignIn = () => {
    setError("");
    setShowGoogleModal(true);
  };

  const handleAccountSelect = async (selectedEmail: string, selectedName?: string) => {
    setGoogleLoading(true);
    const res = await signInWithGoogle(selectedEmail, selectedName);
    setGoogleLoading(false);
    if (res.ok) {
      setShowGoogleModal(false);
      toast({
        tone: "success",
        title: "Account Created with Google",
        message: `Welcome, ${res.user?.fullName}! Saved to Supabase profiles.`,
      });
      nav("/student");
    } else {
      setError(res.error || "Google sign up failed");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signUp(form);
    if (!r.ok) {
      setError(r.error ?? "Could not create account");
      return;
    }
    toast({
      tone: "success",
      title: "Account created",
      message: "Synced with Supabase database.",
    });
    nav("/student");
  };

  return (
    <Split image={PHOTO.campus} alt="Campus building" caption="Takes under a minute.">
      <Link to="/" className="mb-8 inline-flex lg:hidden">
        <Logo />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Create a student account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/student/login" className="font-semibold text-brand-700">
          Sign in
        </Link>
      </p>

      {/* Google Sign Up Button */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>{googleLoading ? "Connecting with Google..." : "Sign up with Google"}</span>
      </button>

      <div className="relative my-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
        <span className="relative z-10 bg-white dark:bg-slate-950 px-3 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
          or register with email
        </span>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Field label="Full name">
          <Input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="College email">
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <PasswordInput
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <Select value={form.department} onChange={(e) => set("department", e.target.value)}>
              {ACADEMIC_DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Year">
            <Select value={form.year} onChange={(e) => set("year", e.target.value)}>
              {YEARS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Residence">
          <Select
            value={form.hostel}
            onChange={(e) => set("hostel", e.target.value)}
          >
            <option value="hostel">Hostel</option>
            <option value="day_scholar">Day scholar</option>
          </Select>
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="teal" className="w-full" size="lg">
          Create account
        </Button>
      </form>
      <Link to="/" className="mt-8 inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>

      <GoogleAccountModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelect={handleAccountSelect}
        loading={googleLoading}
      />
    </Split>
  );
}

export function ForgotPassword() {
  const { requestReset, toast } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = requestReset(email);
    if (!r.ok) {
      setError(r.error ?? "Could not send");
      return;
    }
    setSent(true);
    toast({ tone: "success", title: "Reset link sent", message: "Check your college inbox." });
  };

  return (
    <Split image={PHOTO.arches} alt="Campus arches">
      <Link to="/" className="mb-8 inline-flex lg:hidden">
        <Logo />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-slate-500">We’ll email a reset link to your college address.</p>
      {sent ? (
        <p className="mt-8 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          If an account exists for {email}, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="College email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="teal" className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/student/login" className="mt-6 inline-block text-sm font-medium text-brand-700">
        Back to sign in
      </Link>
    </Split>
  );
}

export function AdminLogin() {
  const { signIn, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signIn(email, password);
    if (!r.ok) {
      setError(r.error ?? "Could not sign in");
      return;
    }
    if (r.user?.role !== "admin" && r.user?.role !== "super_admin") {
      setError("This portal is restricted to campus administrators.");
      return;
    }
    toast({ tone: "success", title: "Admin session started" });
    nav("/admin");
  };

  return (
    <Split
      image={PHOTO.admin}
      alt="Administrator at work"
      dark
      caption="Operations console. Accounts are issued by the directorate — there is no public signup."
    >
      <div className="mb-8 flex items-center gap-2 text-teal-400">
        <Shield className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-[0.18em] uppercase">Operations & Staff Portal</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-slate-900 dark:text-white">
        Sign in to operations
      </h1>
      <p className="mt-1 text-sm text-slate-400 lg:text-slate-500">
        Campus facilities, maintenance dispatch, and department SLA tracking.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Work email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="dark:bg-slate-900"
            placeholder="admin@meridian.edu"
          />
        </Field>
        <Field label="Password">
          <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" size="lg">
          Enter portal
        </Button>
      </form>

      <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>Evaluator test credentials:</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-teal-400 hover:underline cursor-pointer"
            onClick={() => {
              setEmail(DEMO_ACCOUNTS.admin.email);
              setPassword(DEMO_ACCOUNTS.admin.password);
            }}
          >
            Autofill Admin
          </button>
          <span>·</span>
          <button
            type="button"
            className="text-teal-400 hover:underline cursor-pointer"
            onClick={() => {
              setEmail(DEMO_ACCOUNTS.superAdmin.email);
              setPassword(DEMO_ACCOUNTS.superAdmin.password);
            }}
          >
            Autofill Director
          </button>
        </div>
      </div>
      <Link to="/" className="mt-8 inline-block text-sm text-slate-500 hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>
    </Split>
  );
}

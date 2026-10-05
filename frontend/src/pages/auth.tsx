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

export function StudentLogin() {
  const { signIn, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <p className="mt-1 text-sm text-slate-500">Sign in with your official college credentials.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
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
    </Split>
  );
}

export function StudentSignup() {
  const { signUp, toast } = useStore();
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

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      message: "In production we would email a verification link.",
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
      <form onSubmit={submit} className="mt-6 space-y-3">
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

import { Logo } from "@/components/badges";
import { PHOTO } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

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

export function StudentLogin() {
  const { signInWithGoogle, toast } = useStore();

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (!res.ok) {
      toast({ tone: "error", title: "Authentication Failed", message: res.error || "Could not connect to Google." });
    }
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
      <p className="mt-1 text-sm text-slate-500">Sign in securely using your Google account to access your dashboard.</p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mt-8 w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Continue with Google</span>
      </button>

      <div className="mt-6 flex items-center justify-center text-sm">
        <span className="text-slate-500">New here?</span>
        <Link to="/student/signup" className="ml-2 font-medium text-brand-700 hover:underline">
          Create account
        </Link>
      </div>

      <Link to="/" className="mt-12 inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>
    </Split>
  );
}

export function StudentSignup() {
  const { signInWithGoogle, toast } = useStore();

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (!res.ok) {
      toast({ tone: "error", title: "Registration Failed", message: res.error || "Could not register with Google." });
    }
  };

  return (
    <Split image={PHOTO.campus} alt="Campus building" caption="Registration takes under a minute.">
      <Link to="/" className="mb-8 inline-flex lg:hidden">
        <Logo />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Create a student account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Register securely using your official college Google account.
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mt-8 w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Sign up with Google</span>
      </button>

      <div className="mt-6 flex items-center justify-center text-sm">
        <span className="text-slate-500">Already registered?</span>
        <Link to="/student/login" className="ml-2 font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </div>

      <Link to="/" className="mt-12 inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>
    </Split>
  );
}

export function AdminLogin() {
  const { signInWithGoogle, toast } = useStore();

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle("/admin");
    if (!res.ok) {
      toast({ tone: "error", title: "Authentication Failed", message: res.error || "Could not connect to Google." });
    }
  };

  return (
    <Split
      image={PHOTO.admin}
      alt="Administrator at work"
      dark
      caption="Operations console. Access is strictly controlled via organization single sign-on."
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

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mt-8 w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 lg:border-slate-200 lg:dark:border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Continue with Google</span>
      </button>

      <Link to="/" className="mt-12 inline-block text-sm text-slate-500 hover:text-slate-400">
        ← Back to FixMyCampus
      </Link>
    </Split>
  );
}

export function ForgotPassword() {
  // Unused when fully migrated to Google Auth, keeping it as a stub just in case routes still point to it
  return (
    <Split image={PHOTO.arches} alt="Campus arches">
      <Link to="/" className="mb-8 inline-flex lg:hidden">
        <Logo />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Password Reset Disabled</h1>
      <p className="mt-1 text-sm text-slate-500">We have migrated to Google Workspace Authentication. Please sign in with Google instead.</p>
      
      <Link to="/student/login" className="mt-8 inline-block text-sm font-medium text-brand-700">
        Back to sign in
      </Link>
    </Split>
  );
}

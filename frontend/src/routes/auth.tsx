import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { login, signup } from "@/services/authService";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — SkillNest" },
      { name: "description", content: "Access your SkillNest learning circles." },
      { property: "og:title", content: "Log in or sign up — SkillNest" },
      { property: "og:description", content: "Access your SkillNest learning circles." },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auth is mocked: both paths resolve and move the user to the choice screen.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const credentials = { email, password, name };
      await (mode === "login" ? login(credentials) : signup(credentials));
      navigate({ to: ROUTES.home });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /*
      Page Background:
      Subtle light blue-to-mint gradient matching the landing page hero background
      confined to the full viewport for visual continuity.
    */
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#EBF3FF] via-[#EEF7F8] to-[#F9FBFC] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand logo at top */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {/* 
          1. CARD LAYOUT:
          - Centered white card with soft rounded corners (rounded-2xl)
          - Generous internal padding (p-8 sm:p-10) so it does not feel cramped
          - Crisp subtle border and clean shadow
        */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-blue-900/5 sm:p-10">
          {/* 
            2. HEADER TEXT:
            - Bold heading: "Welcome back" (for login) or "Create your account" (for signup)
            - Small subtext below heading: "Log in to continue with your circles and groups."
          */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "login"
                ? "Log in to continue with your circles and groups."
                : "Join a circle and start learning with balanced peer groups."}
            </p>
          </div>

          {/* 
            3. FORM FIELDS:
            - Email field: label "Email" above a rounded, full-width input box
            - Password field: label "Password" above a rounded, full-width input box
            - Retains all existing validation & submit handler logic
          */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Priya Nair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:bg-white"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:bg-white"
                required
              />
            </div>

            {/* 
              4. SUBMIT BUTTON:
              - Full-width, rounded, solid primary color button with clear label ("Login" or "Create account")
            */}
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-[#3B49DF] text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#323ec5]"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </Button>
          </form>

          {/* 
            5. FOOTER LINKS:
            - Thin horizontal divider line
            - Centered text toggle link: "Don't have an account? Create account" / "Already have an account? Login"
            - Subtle link with shield/lock icon: "Admin Portal Login"
          */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-center">
            <div>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <span className="font-semibold text-[#3B49DF] hover:underline">
                      Create account
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="font-semibold text-[#3B49DF] hover:underline">Login</span>
                  </>
                )}
              </button>
            </div>

            {/* Subtle placeholder admin portal link */}
            <div className="pt-1">
              <Link
                to={ROUTES.auth}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ShieldAlert className="size-3 text-slate-400" />
                <span>Admin Portal Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

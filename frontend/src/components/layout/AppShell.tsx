import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { ROUTES } from "@/constants";

interface AppShellProps {
  children: ReactNode;
  /** Public pages hide the signed-in navigation. */
  variant?: "public" | "app";
}

const APP_NAV = [
  { label: "Find circles", to: ROUTES.recommended },
  { label: "Profile", to: ROUTES.profile },
] as const;

/** Shared page frame: slim top bar, content, minimal footer. */
export function AppShell({ children, variant = "app" }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          {variant === "app" ? (
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {APP_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="transition-colors hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : (
            <Link
              to={ROUTES.auth}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Learn together. Grow with the right people.</p>
          <p>© {new Date().getFullYear()} SkillNest</p>
        </div>
      </footer>
    </div>
  );
}

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import type { HomeNavId } from "@/components/home/homeNavItems";
import { ROUTES } from "@/constants";
import { CURRENT_USER } from "@/services/mockData";

interface AppShellProps {
  children: ReactNode;
  /** Public pages hide the signed-in navigation. */
  variant?: "public" | "app";
}

/**
 * Shared page shell. The signed-in top bar is the SAME <HomeTopBar /> used on
 * the home dashboard, so the navigation looks identical on every page.
 * Nav items navigate to real routes here; on /home they switch previews.
 */
export function AppShell({ children, variant = "app" }: AppShellProps) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  const activeId: HomeNavId | null = pathname.startsWith(ROUTES.joinPreferences)
    ? "join-circle"
    : pathname.startsWith(ROUTES.makeCircle)
      ? "make-circle"
      : null;

  const handleSelect = (id: HomeNavId) => {
    if (id === "join-circle") navigate({ to: ROUTES.joinPreferences });
    else if (id === "make-circle") navigate({ to: ROUTES.makeCircle });
    else if (id === "profile-progress") navigate({ to: ROUTES.profile });
    else if (id === "balanced-grouping") navigate({ to: ROUTES.home, hash: "about" });
    else navigate({ to: ROUTES.home });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {variant === "app" ? (
        <div className="sticky top-0 z-40">
          <HomeTopBar user={CURRENT_USER} selectedId={activeId} onSelect={handleSelect} />
        </div>
      ) : (
        <header className="border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <Logo />
            <Link
              to={ROUTES.auth}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>

      <footer className="border-t bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Learn together. Grow with the right people.</p>
          <p>© {new Date().getFullYear()} SkillNest</p>
        </div>
      </footer>
    </div>
  );
}

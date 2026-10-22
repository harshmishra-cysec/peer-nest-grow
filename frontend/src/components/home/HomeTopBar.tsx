import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Flame, LogOut, User as UserIcon, UserCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants";
import { type HomeNavId, TOP_NAV_ITEMS } from "./homeNavItems";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface HomeTopBarProps {
  user: User;
  selectedId: HomeNavId | null;
  onSelect: (id: HomeNavId) => void;
}

/**
 * Top bar h-16 fixed at the top of the dashboard.
 * - Left: Brand Logo
 * - Center: Rounded-full glass pill nav with animated sliding indicator
 * - Right: Streak badge, notification bell, and Profile avatar with dropdown
 */
export function HomeTopBar({ user, selectedId, onSelect }: HomeTopBarProps) {
  const navigate = useNavigate();
  const firstName = user.name.trim().split(" ")[0] || "Learner";
  const itemRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // Update sliding indicator position whenever active item changes or window resizes
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = selectedId ? itemRefs.current.get(selectedId) : undefined;
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        });
      } else {
        // If a sidebar item is selected that is not in the top bar, hide indicator
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [selectedId]);

  const handleLogout = () => {
    navigate({ to: ROUTES.auth });
  };

  return (
    <header className="h-[4.5rem] shrink-0 border-b border-sky-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex h-full items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Center: Glass Pill Navigation */}
        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
          <nav
            aria-label="Primary sections"
            className="relative flex max-w-full items-center overflow-x-auto rounded-full border border-sky-200/80 bg-white/70 p-1 shadow-xs backdrop-blur-sm scrollbar-none"
          >
            {/* Sliding blue indicator */}
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-full bg-primary shadow-xs transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {TOP_NAV_ITEMS.map((item) => {
              const isActive = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current.set(item.id, el);
                  }}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "relative z-10 rounded-full px-5 py-2 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:bg-sky-50/80 hover:text-primary",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Streak, Bell, Avatar Dropdown */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 sm:px-3"
            title={`${user.currentStreakDays} day learning streak`}
          >
            <Flame className="size-4 text-amber-600" />
            <span className="hidden sm:inline">{user.currentStreakDays} days</span>
            <span className="sm:hidden">{user.currentStreakDays}d</span>
          </div>

          {/* Notifications button */}
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
            title="No new notifications"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-0.5 text-left text-sm font-medium transition-all hover:ring-2 hover:ring-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
                aria-label="User account menu"
              >
                <MemberAvatar name={user.name} size="sm" />
                <span className="hidden text-xs sm:text-sm font-semibold text-slate-800 md:inline">
                  Hi, {firstName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-sky-100 bg-white/95 backdrop-blur-md shadow-lg">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                  <p className="text-xs leading-none text-slate-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: ROUTES.profile })}
                className="cursor-pointer gap-2.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-primary focus:bg-sky-50 focus:text-primary"
              >
                <UserIcon className="size-4 text-primary" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSelect("profile-progress")}
                className="cursor-pointer gap-2.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-primary focus:bg-sky-50 focus:text-primary"
              >
                <UserCheck className="size-4 text-primary" />
                <span>Stats & Progress</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2.5 text-xs sm:text-sm text-destructive focus:text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

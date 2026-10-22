import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  CheckCheck,
  UserCheck,
} from "lucide-react";

export type HomeNavId =
  | "home"
  | "join-circle"
  | "make-circle"
  | "recommended-circles"
  | "circle-dashboard"
  | "subgroup-workspace"
  | "peer-verification"
  | "profile-progress"
  | "balanced-grouping";

export interface HomeNavItem {
  id: HomeNavId;
  label: string;
  icon: LucideIcon;
}

export const TOP_NAV_ITEMS = [
  { id: "home" as const, label: "Home" },
  { id: "join-circle" as const, label: "Join" },
  { id: "make-circle" as const, label: "Make" },
  { id: "balanced-grouping" as const, label: "About" },
] as const;

export const HOME_NAV_ITEMS: readonly HomeNavItem[] = [
  {
    id: "recommended-circles",
    label: "Explore Circles",
    icon: Sparkles,
  },
  {
    id: "circle-dashboard",
    label: "Circle Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "subgroup-workspace",
    label: "My Sub-Groups",
    icon: FolderKanban,
  },
  {
    id: "peer-verification",
    label: "Peer Verification",
    icon: CheckCheck,
  },
  {
    id: "profile-progress",
    label: "Stats & Progress",
    icon: UserCheck,
  },
] as const;

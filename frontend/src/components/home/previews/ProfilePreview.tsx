import { PreviewHero } from "../PreviewHero";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ROUTES } from "@/constants";
import type { ActivityItem, Badge, Circle, User } from "@/types";

interface ProfilePreviewProps {
  user: User;
  myCircles: Circle[];
  completedTasks: number;
  badges: Badge[];
  activity: ActivityItem[];
}

/**
 * 7. Stats & Progress panel: hero + the same stat tiles, active circles, badges,
 * streak calendar and activity timeline used on the full profile page.
 */
export function ProfilePreview({
  user,
  myCircles,
  completedTasks,
  badges,
  activity,
}: ProfilePreviewProps) {
  const workspaceCircleIds = new Set(
    myCircles.filter((circle) => circle.status === "Grouped").map((circle) => circle.id),
  );

  return (
    <div className="space-y-6">
      <PreviewHero
        label="REPUTATION & PROGRESS"
        title="Your Learning Journey"
        description="Streaks, verified milestones, badges earned, and historical activity across cohorts."
        ctaText="View profile"
        ctaLink={ROUTES.profile}
      />
      <ProfileOverview
        user={user}
        circles={myCircles}
        badges={badges}
        activity={activity}
        completedTasks={completedTasks}
        workspaceCircleIds={workspaceCircleIds}
      />
    </div>
  );
}

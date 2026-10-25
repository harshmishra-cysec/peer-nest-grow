import { CircleSwitcher } from "./CircleSwitcher";
import { type HomeNavId } from "./homeNavItems";
import { CircleDashboardPreview } from "./previews/CircleDashboardPreview";
import { GroupingPreview } from "./previews/GroupingPreview";
import { JoinPreview } from "./previews/JoinPreview";
import { MakePreview } from "./previews/MakePreview";
import { VerificationPreview } from "./previews/VerificationPreview";
import { ProfilePreview } from "./previews/ProfilePreview";
import { RecommendedPreview } from "./previews/RecommendedPreview";
import { WorkspacePreview } from "./previews/WorkspacePreview";
import { PreviewHero } from "./PreviewHero";
import { ROUTES } from "@/constants";
import type { GroupingResult } from "@/services/groupingService";
import type { ActivityItem, Badge, Circle, SubGroup, Task, User } from "@/types";

interface HomePreviewPanelProps {
  selectedId: HomeNavId;
  currentUser: User;
  allCircles: Circle[];
  myCircles: Circle[];
  primaryCircle?: Circle;
  mySubGroup?: SubGroup;
  tasks: Task[];
  groupingAnalysis?: GroupingResult | null;
  badges: Badge[];
  activity: ActivityItem[];
  completedTasks: number;
  /** Switching between joined circles (Circle Dashboard / My Sub-Groups). */
  onSelectCircle: (circleId: string) => void;
  /** True while the selected circle's sub-group, tasks and grouping are loading. */
  detailLoading: boolean;
}

function DetailLoading() {
  return (
    <div className="surface flex items-center gap-3 p-6">
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm font-semibold text-muted-foreground">Loading circle details…</p>
    </div>
  );
}

/**
 * Main hero preview panel:
 * - Widened content container (max-w-7xl) with generous padding (p-6 sm:p-8 lg:p-10)
 * - Swaps preview in-place with smooth transition
 * - Home view delivers the primary hero overview and active circle dashboard
 */
export function HomePreviewPanel({
  selectedId,
  currentUser,
  allCircles,
  myCircles,
  primaryCircle,
  mySubGroup,
  tasks,
  groupingAnalysis,
  badges,
  activity,
  completedTasks,
  onSelectCircle,
  detailLoading,
}: HomePreviewPanelProps) {
  const firstName = currentUser.name.trim().split(" ")[0] || "Learner";

  return (
    <main
      id={`panel-${selectedId}`}
      role="tabpanel"
      aria-labelledby={`tab-${selectedId}`}
      className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 outline-none"
    >
      <div
        key={selectedId}
        className="mx-auto max-w-7xl transition-all motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-2 duration-200"
      >
        {selectedId === "home" && (
          <div className="space-y-8">
            <PreviewHero
              label="MY LEARNING DASHBOARD"
              title={`Welcome back, ${firstName}`}
              description="Collaborate with your triad, track milestones, and participate in peer verification."
              ctaText="Explore Circles"
              ctaLink={ROUTES.recommended}
              badge="Active Cohort"
            />
            {primaryCircle ? (
              detailLoading ? (
                <DetailLoading />
              ) : (
                <CircleDashboardPreview
                  key={primaryCircle.id}
                  circle={primaryCircle}
                  groupingAnalysis={groupingAnalysis}
                />
              )
            ) : (
              <RecommendedPreview circles={allCircles} currentUser={currentUser} />
            )}
          </div>
        )}

        {selectedId === "join-circle" && <JoinPreview />}

        {selectedId === "make-circle" && <MakePreview />}

        {selectedId === "recommended-circles" && (
          <RecommendedPreview circles={allCircles} currentUser={currentUser} />
        )}

        {selectedId === "circle-dashboard" && (
          <div className="space-y-6">
            <CircleSwitcher
              circles={myCircles}
              activeId={primaryCircle?.id}
              onSelect={onSelectCircle}
              mode="circle"
            />
            {detailLoading ? (
              <DetailLoading />
            ) : (
              <CircleDashboardPreview
                key={primaryCircle?.id}
                circle={primaryCircle}
                groupingAnalysis={groupingAnalysis}
              />
            )}
          </div>
        )}

        {selectedId === "subgroup-workspace" && (
          <div className="space-y-6">
            <CircleSwitcher
              circles={myCircles}
              activeId={primaryCircle?.id}
              onSelect={onSelectCircle}
              mode="subgroup"
            />
            {detailLoading ? (
              <DetailLoading />
            ) : (
              <WorkspacePreview
                key={primaryCircle?.id}
                circle={primaryCircle}
                subGroup={mySubGroup}
                initialTasks={tasks}
                currentUser={currentUser}
              />
            )}
          </div>
        )}

        {selectedId === "peer-verification" && (
          <VerificationPreview
            key={primaryCircle?.id}
            circle={primaryCircle}
            subGroup={mySubGroup}
            tasks={tasks}
            currentUser={currentUser}
          />
        )}

        {selectedId === "profile-progress" && (
          <ProfilePreview
            user={currentUser}
            myCircles={myCircles}
            completedTasks={completedTasks}
            badges={badges}
            activity={activity}
          />
        )}

        {selectedId === "balanced-grouping" && <GroupingPreview />}
      </div>
    </main>
  );
}

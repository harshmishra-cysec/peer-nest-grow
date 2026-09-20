import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award, CheckCircle2, Crown, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/workspace/AddTaskDialog";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { TaskList } from "@/components/workspace/TaskList";
import { ROUTES } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCircleById } from "@/services/circleService";
import { fetchMessages, sendMessage } from "@/services/chatService";
import {
  commentOnTask,
  confirmTask,
  createTask,
  getMySubGroupForCircle,
  getTasks,
  markTaskDone,
  type NewTaskInput,
} from "@/services/subGroupService";
import { getCurrentUser, getMyBadges } from "@/services/userService";
import type { ChatAttachment, Task } from "@/types";

export const Route = createFileRoute("/circles/$circleId/subgroup")({
  head: () => ({
    meta: [
      { title: "Sub-group workspace — SkillNest" },
      {
        name: "description",
        content: "Chat, shared tasks and peer confirmation for your sub-group.",
      },
      { property: "og:title", content: "Sub-group workspace — SkillNest" },
      {
        property: "og:description",
        content: "Chat, shared tasks and peer confirmation for your sub-group.",
      },
    ],
  }),
  component: SubGroupWorkspacePage,
});

/** Loads everything the workspace needs in one pass; returns undefined if the user has no sub-group here. */
async function loadWorkspace(circleId: string) {
  console.log(`[Workspace] Loading workspace data for circleId: "${circleId}"`);
  const subGroup = await getMySubGroupForCircle(circleId);
  console.log(
    `[Workspace] getMySubGroupForCircle("${circleId}") result:`,
    subGroup
      ? `${subGroup.name} (id: ${subGroup.id}, members: ${subGroup.members.length})`
      : "none",
  );
  if (!subGroup) return undefined;
  const [circle, tasks, messages, currentUser, badges] = await Promise.all([
    getCircleById(circleId),
    getTasks(subGroup.id),
    fetchMessages(subGroup.id),
    getCurrentUser(),
    getMyBadges(),
  ]);
  console.log(
    `[Workspace] Successfully loaded workspace for "${circle?.name ?? circleId}":`,
    `${tasks.length} tasks, ${messages.length} messages, ${subGroup.members.length} members`,
  );
  return { subGroup, circle, tasks, messages, currentUser, badges };
}

function SubGroupWorkspacePage() {
  const { circleId } = Route.useParams();
  const { data, loading, setData } = useAsyncData(() => loadWorkspace(circleId), [circleId]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </AppShell>
    );
  }
  if (!data) {
    return (
      <AppShell>
        <div className="surface mx-auto max-w-md p-8 text-center">
          <p className="text-base font-semibold">No active sub-group yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have a sub-group in this circle yet — balanced sub-groups form automatically
            once the circle reaches 9 members.
          </p>
          <Button asChild className="mt-6">
            <Link to={ROUTES.circle} params={{ circleId }}>
              Back to Circle Dashboard
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const { subGroup, circle, tasks, messages, currentUser, badges } = data;
  const verifiedCount = tasks.filter((task) => task.status === "Verified").length;
  const verifiedPercent = tasks.length === 0 ? 0 : Math.round((verifiedCount / tasks.length) * 100);

  // Each handler waits for the service to echo the saved entity, then merges it
  // into local state — so the UI never shows something the "server" rejected.
  const replaceTask = (updated: Task) =>
    setData(
      (prev) =>
        prev && { ...prev, tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)) },
    );

  const handleSendMessage = async (body: string, attachments?: ChatAttachment[]) => {
    const sent = await sendMessage(subGroup.id, body, attachments);
    setData((prev) => prev && { ...prev, messages: [...prev.messages, sent] });
  };

  const handleCreateTask = async (input: NewTaskInput) => {
    const created = await createTask(subGroup.id, input);
    setData((prev) => prev && { ...prev, tasks: [...prev.tasks, created] });
  };

  const handleMarkTaskDone = async (
    task: Task,
    proofUrl?: string,
    proofAttachments?: Task["proofAttachments"],
  ) => replaceTask(await markTaskDone(task, proofUrl, proofAttachments));
  const handleConfirmTask = async (task: Task, comment?: string) =>
    replaceTask(await confirmTask(task, comment));
  const handleCommentOnly = async (task: Task, comment: string) =>
    replaceTask(await commentOnTask(task, comment));

  const stats = [
    {
      Icon: Flame,
      label: "Day streak",
      value: currentUser.currentStreakDays,
      iconClass: "text-warning",
    },
    { Icon: Award, label: "Badges", value: badges.length, iconClass: "" },
    {
      Icon: CheckCircle2,
      label: "Tasks verified",
      value: `${verifiedPercent}%`,
      iconClass: "text-success",
    },
  ];

  return (
    <AppShell>
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {circle && (
            <Link
              to={ROUTES.circle}
              params={{ circleId: circle.id }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> {circle.name} · {circle.topic}
            </Link>
          )}
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{subGroup.name}</h1>
        </div>
        <dl className="flex gap-6 sm:gap-8">
          {stats.map(({ Icon, label, value, iconClass }) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className={`size-4 ${iconClass}`} /> {label}
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks & milestones</h2>
              {/* Any member can add tasks — creation is intentionally not leader-only. */}
              <AddTaskDialog
                members={subGroup.members}
                defaultAssigneeUserId={currentUser.id}
                onCreate={handleCreateTask}
              />
            </div>
            <TaskList
              tasks={tasks}
              members={subGroup.members}
              currentUserId={currentUser.id}
              onMarkDone={handleMarkTaskDone}
              onConfirm={handleConfirmTask}
              onCommentOnly={handleCommentOnly}
            />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sub-group members</h2>
              <span className="text-xs text-muted-foreground">3 learners · 1 leader</span>
            </div>
            <ul className="surface divide-y">
              {subGroup.members.map((member) => {
                // Leader is whoever the grouping system picked (the Advanced member).
                const isLeader = member.userId === subGroup.leaderUserId;
                return (
                  <li key={member.userId} className="flex items-center gap-3 px-4 py-3">
                    <MemberAvatar name={member.name} size="sm" />
                    <span className="flex-1 truncate text-sm font-medium">
                      {member.name}
                      {member.userId === currentUser.id && (
                        <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                      )}
                    </span>
                    {isLeader && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning">
                        <Crown className="size-3" /> Leader
                      </span>
                    )}
                    <SkillBadge level={member.skillLevel} />
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <ChatPanel messages={messages} currentUserId={currentUser.id} onSend={handleSendMessage} />
      </div>
    </AppShell>
  );
}

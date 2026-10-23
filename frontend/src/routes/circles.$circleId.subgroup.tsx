import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Crown,
  Flame,
  Flag,
  FolderGit2,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/workspace/AddTaskDialog";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { MilestonesList } from "@/components/workspace/MilestonesList";
import { ResourcesList } from "@/components/workspace/ResourcesList";
import { TaskList } from "@/components/workspace/TaskList";
import { ROUTES } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCircleById } from "@/services/circleService";
import { fetchMessages, sendMessage } from "@/services/chatService";
import { addMilestone, getMilestones, updateMilestoneStatus } from "@/services/milestoneService";
import { addResource, getResources } from "@/services/resourceService";
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
import type { ChatAttachment, Milestone, MilestoneStatus, Resource, Task } from "@/types";

export const Route = createFileRoute("/circles/$circleId/subgroup")({
  head: () => ({
    meta: [
      { title: "Sub-group workspace — SkillNest" },
      {
        name: "description",
        content: "Chat, shared tasks, milestones and resources for your sub-group.",
      },
      { property: "og:title", content: "Sub-group workspace — SkillNest" },
      {
        property: "og:description",
        content: "Chat, shared tasks, milestones and resources for your sub-group.",
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
  const [circle, tasks, messages, currentUser, badges, milestones, resources] = await Promise.all([
    getCircleById(circleId),
    getTasks(subGroup.id),
    fetchMessages(subGroup.id),
    getCurrentUser(),
    getMyBadges(),
    getMilestones(subGroup.id),
    getResources(subGroup.id),
  ]);
  console.log(
    `[Workspace] Successfully loaded workspace for "${circle?.name ?? circleId}":`,
    `${tasks.length} tasks, ${messages.length} messages, ${milestones.length} milestones, ${resources.length} resources, ${subGroup.members.length} members`,
  );
  return { subGroup, circle, tasks, messages, currentUser, badges, milestones, resources };
}

type WorkspaceTab = "chat" | "tasks" | "milestones" | "resources";

function SubGroupWorkspacePage() {
  const { circleId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("tasks");
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

  const { subGroup, circle, tasks, messages, currentUser, badges, milestones, resources } = data;
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

  // Milestone handlers
  const handleUpdateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
    const updated = await updateMilestoneStatus(milestoneId, status);
    setData(
      (prev) =>
        prev && {
          ...prev,
          milestones: prev.milestones.map((m) => (m.id === updated.id ? updated : m)),
        },
    );
  };

  const handleAddMilestone = async (input: {
    title: string;
    dueDate: string;
    description?: string;
  }) => {
    const created = await addMilestone(subGroup.id, input);
    setData((prev) => prev && { ...prev, milestones: [...prev.milestones, created] });
  };

  // Resource handlers
  const handleAddResource = async (input: { title: string; url: string; addedBy: string }) => {
    const created = await addResource(subGroup.id, input);
    setData((prev) => prev && { ...prev, resources: [created, ...prev.resources] });
  };

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

      {/* Navigation tabs for the Sub-Group Workspace */}
      <div className="mt-8 border-b border-border">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <ListTodo className="size-4" />
            <span>Tasks</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "tasks"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "milestones"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Flag className="size-4" />
            <span>Milestones</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "milestones"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "resources"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <FolderGit2 className="size-4" />
            <span>Resources</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "resources"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {resources.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "chat"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4" />
            <span>Chat</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "chat"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {messages.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab contents */}
      <div className="mt-6">
        {activeTab === "tasks" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Primary Full Width Task Section */}
            <div className="space-y-6">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Tasks & milestones</h2>
                    <p className="text-xs text-muted-foreground">
                      Track deliverables, attach proof, and verify peer submissions.
                    </p>
                  </div>
                  {/* Any member can add tasks; only the leader can assign them to others. */}
                  <AddTaskDialog
                    members={subGroup.members}
                    defaultAssigneeUserId={currentUser.id}
                    canAssignOthers={subGroup.leaderUserId === currentUser.id}
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
            </div>

            {/* Sidebar with Sub-group members and quick helper card */}
            <div className="space-y-6">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Sub-group members</h2>
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

              {/* Quick tip card */}
              <div className="surface p-5 space-y-2.5 bg-slate-50/50">
                <h3 className="font-semibold text-sm text-foreground">Peer Verification</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When a team member marks a task complete with proof (GitHub link, Loom video, or
                  files), other members review and verify it to unlock streak rewards.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <MilestonesList
                milestones={milestones}
                onUpdateStatus={handleUpdateMilestoneStatus}
                onAddMilestone={handleAddMilestone}
              />
            </div>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sub-group members</h2>
                <span className="text-xs text-muted-foreground">3 learners</span>
              </div>
              <ul className="surface divide-y">
                {subGroup.members.map((member) => {
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
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <ResourcesList
                resources={resources}
                currentUserName={currentUser.name}
                onAddResource={handleAddResource}
              />
            </div>
            <div>
              <div className="surface p-5 space-y-4">
                <h3 className="font-semibold text-foreground text-sm">
                  Resource Sharing Guidelines
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                  <li>Share official docs, articles, YouTube breakdowns, and problem trackers.</li>
                  <li>Avoid sharing paywalled materials or spam links.</li>
                  <li>Include descriptive titles so peers know what to expect before clicking.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-4xl">
            <ChatPanel
              messages={messages}
              currentUserId={currentUser.id}
              onSend={handleSendMessage}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}

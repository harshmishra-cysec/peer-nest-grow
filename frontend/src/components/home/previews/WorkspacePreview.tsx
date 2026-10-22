import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, ExternalLink, Flag, FolderGit2, ListTodo, MessageSquare } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import { formatDate, formatRelative } from "@/lib/format";
import { fetchMessages } from "@/services/chatService";
import { getMilestones } from "@/services/milestoneService";
import { getResources } from "@/services/resourceService";
import type { Circle, Message, Milestone, Resource, SubGroup, Task, User } from "@/types";

interface WorkspacePreviewProps {
  circle?: Circle;
  subGroup?: SubGroup;
  initialTasks: Task[];
  currentUser: User;
}

/**
 * 5. Sub-Group Workspace Preview:
 * - shadcn Tabs (Tasks, Milestones, Resources, Chat), up to 4 rows per tab.
 * - Reuse TaskStatusBadge for task status.
 * - Small members card using MemberAvatar with a Crown icon on the member whose id equals leaderUserId.
 * - Workspace tabs other than Tasks load lazily only when that tab is opened.
 * - CTA "Enter workspace" -> ROUTES.subGroup with params.
 * - Empty state if user has no circle/sub-group.
 */
export function WorkspacePreview({
  circle,
  subGroup,
  initialTasks,
  currentUser,
}: WorkspacePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("tasks");

  // Lazy loaded states for milestones, resources, chat
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);

  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Lazy fetch on tab switch
  useEffect(() => {
    if (!subGroup) return;

    if (activeTab === "milestones" && milestones === null && !loadingMilestones) {
      setLoadingMilestones(true);
      getMilestones(subGroup.id)
        .then((res) => setMilestones(res))
        .finally(() => setLoadingMilestones(false));
    } else if (activeTab === "resources" && resources === null && !loadingResources) {
      setLoadingResources(true);
      getResources(subGroup.id)
        .then((res) => setResources(res))
        .finally(() => setLoadingResources(false));
    } else if (activeTab === "chat" && messages === null && !loadingMessages) {
      setLoadingMessages(true);
      fetchMessages(subGroup.id)
        .then((res) => setMessages(res))
        .finally(() => setLoadingMessages(false));
    }
  }, [
    activeTab,
    subGroup,
    milestones,
    resources,
    messages,
    loadingMilestones,
    loadingResources,
    loadingMessages,
  ]);

  if (!circle || !subGroup) {
    return (
      <div className="space-y-6">
        <PreviewHero
          label="SUB-GROUP WORKSPACE"
          title="Team Workspace"
          description="Collaborate with your triad: assigned tasks, milestones, shared docs, and chat."
        />
        <div className="surface p-8 text-center space-y-3">
          <p className="text-base font-semibold text-foreground">No active sub-group yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Once your circle reaches 9 members, the balanced grouping engine forms your 3-person
            learning triad and assigns a team leader.
          </p>
          <Button asChild size="sm">
            <Link to={ROUTES.recommended}>Explore circles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PreviewHero
        label="SUB-GROUP WORKSPACE"
        title={subGroup.name}
        description={`Active workspace for ${circle.name} · Peer-driven tasks and reviews.`}
        ctaText="Enter workspace"
        ctaLink={ROUTES.subGroup}
        ctaParams={{ circleId: circle.id }}
        badge={`${subGroup.members.length} members`}
      />

      {/* Main Workspace Layout: Tabs left/main + Members Card right */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Workspace Tabs */}
        <div className="surface p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="tasks" className="text-sm gap-1.5">
                <ListTodo className="size-4.5" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="milestones" className="text-sm gap-1.5">
                <Flag className="size-4.5" />
                <span>Milestones</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-sm gap-1.5">
                <FolderGit2 className="size-4.5" />
                <span>Resources</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-sm gap-1.5">
                <MessageSquare className="size-4.5" />
                <span>Chat</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Tasks (up to 4 rows) */}
            <TabsContent value="tasks" className="mt-0 space-y-2">
              {initialTasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No tasks created yet in this sub-group.
                </p>
              ) : (
                initialTasks.slice(0, 4).map((task) => {
                  const assignee = subGroup.members.find((m) => m.userId === task.assigneeUserId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card p-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {assignee ? assignee.name : "Assigned"} · Due {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* TAB 2: Milestones (up to 4 rows) */}
            <TabsContent value="milestones" className="mt-0 space-y-2">
              {loadingMilestones ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Loading milestones…
                </p>
              ) : !milestones || milestones.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No milestones configured yet.
                </p>
              ) : (
                milestones.slice(0, 4).map((ms) => (
                  <div
                    key={ms.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card p-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{ms.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Due {formatDate(ms.dueDate)}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                      {ms.status}
                    </span>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 3: Resources (up to 4 rows) */}
            <TabsContent value="resources" className="mt-0 space-y-2">
              {loadingResources ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading resources…</p>
              ) : !resources || resources.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No shared resources yet.
                </p>
              ) : (
                resources.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card p-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{res.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Shared by {res.addedBy}
                      </p>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
                    >
                      <span>Open</span>
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 4: Chat (up to 4 messages) */}
            <TabsContent value="chat" className="mt-0 space-y-2">
              {loadingMessages ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading chat…</p>
              ) : !messages || messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No messages in discussion yet.
                </p>
              ) : (
                messages.slice(-4).map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-border/70 bg-card p-3 shadow-2xs text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {msg.senderName}{" "}
                        {msg.senderUserId === currentUser.id && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            (you)
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelative(msg.sentAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{msg.body}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Small Members Card */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Triad Members
              </h3>
              <span className="text-[10px] text-muted-foreground">1:1:1 Mix</span>
            </div>

            <ul className="divide-y divide-border/60">
              {subGroup.members.map((member) => {
                const isLeader = member.userId === subGroup.leaderUserId;
                const isMe = member.userId === currentUser.id;

                return (
                  <li key={member.userId} className="flex items-center gap-2.5 py-2.5">
                    <MemberAvatar name={member.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {member.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            (you)
                          </span>
                        )}
                        {isLeader && (
                          <Crown
                            className="size-4 text-warning shrink-0"
                            title="Sub-group Leader"
                          />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <SkillBadge level={member.skillLevel} className="text-[10px] py-0 px-2" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground pt-3 border-t border-border/60">
            Leader elected automatically from Advanced member.
          </p>
        </div>
      </div>
    </div>
  );
}

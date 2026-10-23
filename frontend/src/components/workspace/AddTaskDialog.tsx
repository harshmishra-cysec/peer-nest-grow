import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NewTaskInput } from "@/services/subGroupService";
import type { CircleMember } from "@/types";

interface AddTaskDialogProps {
  members: CircleMember[];
  defaultAssigneeUserId: string;
  /** Only the group leader can assign tasks to other members. */
  canAssignOthers?: boolean;
  onCreate: (input: NewTaskInput) => Promise<void>;
}

function getDefaultDueDate() {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  return target.toISOString().split("T")[0];
}

/** Any member can add a task; only the leader can assign it to someone else. */
export function AddTaskDialog({
  members,
  defaultAssigneeUserId,
  canAssignOthers = false,
  onCreate,
}: AddTaskDialogProps) {
  const assignable = canAssignOthers
    ? members
    : members.filter((m) => m.userId === defaultAssigneeUserId);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewTaskInput>({
    title: "",
    description: "",
    assigneeUserId: defaultAssigneeUserId,
    dueDate: getDefaultDueDate(),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onCreate(form);
      setForm({
        title: "",
        description: "",
        assigneeUserId: defaultAssigneeUserId,
        dueDate: getDefaultDueDate(),
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              <NativeSelect
                id="task-assignee"
                value={form.assigneeUserId}
                onChange={(e) => setForm({ ...form, assigneeUserId: e.target.value })}
              >
                {assignable.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
                className="h-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            Add task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

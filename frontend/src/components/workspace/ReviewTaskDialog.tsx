import { useState, type FormEvent } from "react";
import {
  Check,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  MessageSquare,
  Paperclip,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task } from "@/types";

interface ReviewTaskDialogProps {
  task: Task | null;
  mode: "confirm" | "comment";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (task: Task, comment?: string) => Promise<void>;
  onCommentOnly: (task: Task, comment: string) => Promise<void>;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Dialog allowing peer members to review submitted work:
 * - Inspect attached proof URLs and uploaded photos/files.
 * - Confirm task completion with optional praise.
 * - Or post a feedback note requesting updates.
 */
export function ReviewTaskDialog({
  task,
  mode,
  open,
  onOpenChange,
  onConfirm,
  onCommentOnly,
}: ReviewTaskDialogProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!task) return null;

  const isConfirm = mode === "confirm";
  const hasProofUrl = Boolean(task.proofUrl);
  const hasAttachments = Boolean(task.proofAttachments && task.proofAttachments.length > 0);
  const hasProof = hasProofUrl || hasAttachments;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isConfirm) {
        await onConfirm(task, comment.trim() || undefined);
      } else {
        await onCommentOnly(task, comment.trim());
      }
      setComment("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isConfirm ? "Confirm Task Completion" : "Leave Review Note"}</DialogTitle>
          <DialogDescription>
            {isConfirm
              ? "Verify that your peer completed this milestone according to your sub-group goals."
              : "Send constructive feedback to your peer without verifying the milestone yet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-surface-muted/60 p-3.5 text-sm border border-border/50 space-y-3">
            <div>
              <span className="font-semibold text-foreground">{task.title}</span>
              {task.description && (
                <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
              )}
            </div>

            {/* Proof Section */}
            <div className="border-t border-border/50 pt-2.5 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-primary" /> Submitted Proof of Work:
              </span>

              {hasProofUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Link:</span>
                  <a
                    href={task.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline hover:text-primary-hover break-all font-medium"
                  >
                    <span>{task.proofUrl}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}

              {hasAttachments && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Attached Photos & Files ({task.proofAttachments!.length}):
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {task.proofAttachments!.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-surface p-2 text-xs"
                      >
                        {att.type === "image" ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(att.url)}
                            className="group relative size-10 shrink-0 overflow-hidden rounded border border-border bg-surface-muted cursor-pointer"
                            title="Click to expand photo"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="size-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded border border-border bg-primary/5 text-primary">
                            <FileText className="size-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {att.type === "image" ? "Photo" : "Document"}
                            {att.size ? ` · ${formatBytes(att.size)}` : ""}
                          </p>
                        </div>

                        <a
                          href={att.url}
                          download={att.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                          title="Open or Download"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasProof && (
                <p className="text-xs text-muted-foreground italic">No proof attached</p>
              )}
            </div>
          </div>

          {/* Comment/Feedback input */}
          <div className="space-y-2">
            <Label
              htmlFor="peerComment"
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <MessageSquare className="size-3.5 text-primary" />
              {isConfirm ? (
                <>
                  Short note or praise{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </>
              ) : (
                "Review feedback / reason"
              )}
            </Label>
            <Input
              id="peerComment"
              type="text"
              placeholder={
                isConfirm
                  ? 'e.g. "Clean code and diagrams look solid!"'
                  : 'e.g. "Proof photo is blurry, please re-upload"'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={!isConfirm}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {isConfirm
                ? "This note is optional and will appear under the task for the sub-group to see."
                : "Your note will appear under the task so the assignee knows what to adjust."}
            </p>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isConfirm ? "default" : "outline"}
              disabled={submitting || (!isConfirm && !comment.trim())}
            >
              {isConfirm ? (
                <>
                  <Check className="mr-1.5 size-3.5" />
                  {submitting ? "Confirming…" : "Confirm Task"}
                </>
              ) : (
                <>
                  <Send className="mr-1.5 size-3.5" />
                  {submitting ? "Saving…" : "Post Note"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Full Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg bg-background p-2">
              <img
                src={previewImage}
                alt="Proof preview"
                className="max-h-[80vh] w-auto rounded object-contain"
                referrerPolicy="no-referrer"
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Click anywhere to close preview
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

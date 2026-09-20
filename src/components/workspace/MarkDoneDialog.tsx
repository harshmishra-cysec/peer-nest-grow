import { useState, useRef, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { Check, FileText, ImageIcon, Link2, Paperclip, Trash2, UploadCloud, X } from "lucide-react";
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
import type { ProofAttachment, Task } from "@/types";

interface MarkDoneDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Task, proofUrl?: string, proofAttachments?: ProofAttachment[]) => Promise<void>;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Dialog prompting the assignee to optionally submit a proof link
 * (GitHub repo URL, shared doc, etc.) along with uploaded files & photos
 * before marking a task as done.
 */
export function MarkDoneDialog({ task, open, onOpenChange, onSubmit }: MarkDoneDialogProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [attachments, setAttachments] = useState<ProofAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: ProofAttachment = {
          id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: dataUrl,
          type: isImage ? "image" : "file",
          size: file.size,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(
        task,
        proofUrl.trim() || undefined,
        attachments.length > 0 ? attachments : undefined,
      );
      setProofUrl("");
      setAttachments([]);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setProofUrl("");
      setAttachments([]);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Task as Done</DialogTitle>
          <DialogDescription>
            Submit your work for peer review in your sub-group. Add a link, upload photos, or attach
            files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Summary */}
          <div className="rounded-lg bg-surface-muted/60 p-3 text-sm border border-border/50">
            <span className="font-semibold text-foreground">{task.title}</span>
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Option 1: URL input */}
          <div className="space-y-1.5">
            <Label htmlFor="proofUrl" className="flex items-center gap-1.5 text-xs font-semibold">
              <Link2 className="size-3.5 text-primary" />
              Proof Link{" "}
              <span className="text-muted-foreground font-normal">(GitHub, Docs, Loom, etc.)</span>
            </Label>
            <Input
              id="proofUrl"
              type="url"
              placeholder="e.g. https://github.com/... or https://docs.google.com/..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Option 2: File & Photo Upload with Drag & Drop */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Paperclip className="size-3.5 text-primary" />
              Upload Photos & Files{" "}
              <span className="text-muted-foreground font-normal">(Screenshots, PDFs, code)</span>
            </Label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.json,.ts,.js,.py,.cpp,.java"
              onChange={handleFileInputChange}
              className="hidden"
              id="proof-file-upload"
            />

            {/* Dropzone area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-surface-muted/30"
              }`}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <UploadCloud className="size-5" />
              </div>
              <p className="text-xs font-medium text-foreground">
                <span className="text-primary font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Photos (PNG, JPG), code files, PDFs, or documents
              </p>
            </div>

            {/* Uploaded Files & Photos Preview List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Attached items ({attachments.length})</span>
                  <button
                    type="button"
                    onClick={() => setAttachments([])}
                    className="text-[11px] text-destructive hover:underline font-normal cursor-pointer"
                  >
                    Remove all
                  </button>
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="group relative flex items-center gap-2.5 rounded-lg border border-border bg-surface p-2 text-xs shadow-xs"
                    >
                      {att.type === "image" ? (
                        <div className="size-10 shrink-0 overflow-hidden rounded border border-border bg-surface-muted">
                          <img
                            src={att.url}
                            alt={att.name}
                            className="size-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(att.id);
                        }}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        title="Delete attachment"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              <Check className="mr-1.5 size-3.5" />
              {submitting ? "Submitting…" : "Submit for Peer Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

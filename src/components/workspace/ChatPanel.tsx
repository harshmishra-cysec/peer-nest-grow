import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  Download,
  FileText,
  ImageIcon,
  Paperclip,
  SendHorizontal,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChatAttachment, Message } from "@/types";

interface ChatPanelProps {
  messages: Message[];
  currentUserId: string;
  onSend: (body: string, attachments?: ChatAttachment[]) => Promise<void>;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Scrollable message list with photo/file upload and an interactive message composer. */
export function ChatPanel({ messages, currentUserId, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Scroll smoothly to newest message on update
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: ChatAttachment = {
          id: `chat-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    // Only turn off if leaving the main container
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
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

  const handleSubmit = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    const body = draft.trim();
    const hasAttachments = attachments.length > 0;

    if (!body && !hasAttachments) return;

    setSending(true);
    try {
      await onSend(
        body || (hasAttachments ? "Shared attachment" : ""),
        hasAttachments ? attachments : undefined,
      );
      setDraft("");
      setAttachments([]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "surface relative flex h-[540px] flex-col rounded-xl transition-all",
        isDragging && "ring-2 ring-primary bg-primary/5",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold text-foreground">Group chat</h2>
          <p className="text-[11px] text-muted-foreground">Share updates, photos & study files</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 gap-1.5 text-xs"
          title="Attach photos or files"
        >
          <Paperclip className="size-3.5 text-primary" />
          <span>Attach</span>
        </Button>
      </div>

      {/* Drag & drop overlay indicator */}
      {isDragging && (
        <div className="absolute inset-x-0 top-12 bottom-16 z-30 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs p-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 animate-bounce">
            <UploadCloud className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">Drop files or photos to attach</p>
          <p className="text-xs text-muted-foreground">They'll be queued into your message draft</p>
        </div>
      )}

      {/* Messages list */}
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
          <p>No messages yet.</p>
          <p className="mt-1 text-xs">Say hello or share notes and photos with your sub-group!</p>
        </div>
      ) : (
        <ol className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => {
            const mine = message.senderUserId === currentUserId;
            const messageAttachments = message.attachments || [];

            return (
              <li key={message.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                <MemberAvatar name={message.senderName} size="sm" />
                <div className={cn("max-w-[82%]", mine && "text-right")}>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{message.senderName}</span>
                    {mine && " (you)"} · {formatTime(message.sentAt)}
                  </p>

                  {/* Message body bubble */}
                  {message.body && (
                    <div
                      className={cn(
                        "mt-1 inline-block rounded-2xl px-3.5 py-2 text-left text-sm leading-relaxed",
                        mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {message.body}
                    </div>
                  )}

                  {/* Attached photos and files in chat bubble */}
                  {messageAttachments.length > 0 && (
                    <div
                      className={cn(
                        "mt-1.5 flex flex-wrap gap-2",
                        mine ? "justify-end" : "justify-start",
                      )}
                    >
                      {messageAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs"
                        >
                          {att.type === "image" ? (
                            <div className="group relative">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(att.url)}
                                className="block cursor-pointer overflow-hidden"
                                title="Click to view photo"
                              >
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="h-28 w-44 rounded-t object-cover transition-transform duration-200 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                              </button>
                              <div className="flex items-center justify-between gap-1 bg-surface p-1.5 text-[11px]">
                                <span
                                  className="max-w-[100px] truncate font-medium text-foreground"
                                  title={att.name}
                                >
                                  {att.name}
                                </span>
                                <a
                                  href={att.url}
                                  download={att.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                                  title="Download photo"
                                >
                                  <Download className="size-3.5" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 text-xs">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                                <FileText className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <p
                                  className="max-w-[130px] truncate font-medium text-foreground"
                                  title={att.name}
                                >
                                  {att.name}
                                </p>
                                {att.size && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatBytes(att.size)}
                                  </p>
                                )}
                              </div>
                              <a
                                href={att.url}
                                download={att.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                                title="Download file"
                              >
                                <Download className="size-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          <div ref={listEndRef} />
        </ol>
      )}

      {/* Hidden file input supporting photos and arbitrary files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.json,.ts,.js,.py,.cpp,.java,.csv"
        onChange={handleFileInputChange}
        className="hidden"
        id="chat-file-upload"
      />

      {/* Attachment staging tray right above composer */}
      {attachments.length > 0 && (
        <div className="border-t bg-surface-muted/40 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Ready to send ({attachments.length})</span>
            <button
              type="button"
              onClick={() => setAttachments([])}
              className="text-destructive hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 rounded-md border border-border bg-card p-1.5 pr-2 text-xs shadow-2xs"
              >
                {att.type === "image" ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="size-7 rounded object-cover border border-border/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded bg-primary/10 text-primary">
                    <FileText className="size-3.5" />
                  </div>
                )}
                <div className="max-w-[120px] truncate text-[11px]">
                  <p className="truncate font-medium text-foreground">{att.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  title="Remove"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-3 bg-card rounded-b-xl"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          title="Upload photo or file"
        >
          <Paperclip className="size-5" />
        </Button>

        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            attachments.length > 0
              ? "Add a caption or press Send..."
              : "Message your sub-group or attach files..."
          }
          className="h-10 flex-1 bg-background"
          aria-label="Message"
        />

        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0"
          disabled={sending || (!draft.trim() && attachments.length === 0)}
          aria-label="Send message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </form>

      {/* Full Photo Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg bg-background p-2">
            <img
              src={previewImage}
              alt="Full chat preview"
              className="max-h-[80vh] w-auto rounded object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

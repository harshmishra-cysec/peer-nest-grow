import { useState } from "react";
import { ExternalLink, Globe, Link2, Plus, Share2, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import type { Resource } from "@/types";

interface ResourcesListProps {
  resources: Resource[];
  currentUserName: string;
  onAddResource: (input: { title: string; url: string; addedBy: string }) => Promise<void>;
}

export function ResourcesList({ resources, currentUserName, onAddResource }: ResourcesListProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setSubmitting(true);
    try {
      await onAddResource({
        title: title.trim(),
        url: url.trim(),
        addedBy: currentUserName,
      });
      setTitle("");
      setUrl("");
      setOpenAddDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Share2 className="size-4" />
            </div>
            <h3 className="font-semibold text-foreground">Shared Knowledge Repository</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Curated problem sets, documentation, guides, and tools recommended by your sub-group.
          </p>
        </div>

        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 shrink-0">
              <Plus className="size-3.5" />
              <span>Add Resource</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Share a Resource</DialogTitle>
                <DialogDescription>
                  Add a helpful article, problem roadmap, GitHub repo, or tutorial for your
                  sub-group.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="resource-title" className="text-xs font-semibold">
                    Resource Title
                  </Label>
                  <Input
                    id="resource-title"
                    placeholder="e.g. NeetCode 150 Practice Roadmap"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="resource-url" className="text-xs font-semibold">
                    Resource URL
                  </Label>
                  <Input
                    id="resource-url"
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Web address or documentation link (http/https).
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenAddDialog(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !title.trim() || !url.trim()}>
                  {submitting ? "Sharing..." : "Share Resource"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resource List Items */}
      {resources.length === 0 ? (
        <div className="surface p-8 text-center">
          <Globe className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No resources shared yet.</p>
          <p className="text-xs text-muted-foreground">
            Be the first to share an insightful link, cheat sheet, or tool!
          </p>
        </div>
      ) : (
        <ul className="surface divide-y">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-surface-muted/20"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <Link2 className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <span className="truncate">{resource.title}</span>
                      <ExternalLink className="size-3 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <p className="truncate text-xs text-muted-foreground font-mono">
                      {resource.url}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pl-8 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3 text-muted-foreground" />
                    Added by <span className="font-medium text-foreground">{resource.addedBy}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    {formatDate(resource.addedDate)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center pl-8 sm:pl-0">
                <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <span>Visit Link</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

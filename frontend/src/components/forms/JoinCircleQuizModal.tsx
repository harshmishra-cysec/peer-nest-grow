import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkillQuizWizard } from "@/components/forms/SkillQuizWizard";
import type { AssessmentResult } from "@/services/assessmentService";
import type { SkillLevel } from "@/types";

interface JoinCircleQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleName: string;
  topic: string;
  onConfirmJoin: (assessedSkillLevel: SkillLevel, result: AssessmentResult) => void;
}

export function JoinCircleQuizModal({
  open,
  onOpenChange,
  circleName,
  topic,
  onConfirmJoin,
}: JoinCircleQuizModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl p-0 border-none bg-transparent shadow-none">
        <SkillQuizWizard
          topic={topic}
          confirmButtonLabel={`Join "${circleName}"`}
          onComplete={(level, result) => {
            onConfirmJoin(level, result);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

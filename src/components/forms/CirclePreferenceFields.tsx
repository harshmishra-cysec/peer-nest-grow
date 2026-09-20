import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "./NativeSelect";
import { OptionCards } from "./OptionCards";
import {
  COMMITMENT_HINTS,
  COMMITMENT_LEVELS,
  GOAL_TYPES,
  GOAL_TYPE_HINTS,
  TOPICS,
} from "@/constants";
import type { CirclePreferences, CommitmentLevel, GoalType } from "@/types";

interface CirclePreferenceFieldsProps {
  value: CirclePreferences;
  onChange: (next: CirclePreferences) => void;
}

/**
 * Topic / goal / commitment / deadline — shared by the Make form and the
 * Join preference form so both stay identical.
 */
export function CirclePreferenceFields({ value, onChange }: CirclePreferenceFieldsProps) {
  const update = <K extends keyof CirclePreferences>(key: K, fieldValue: CirclePreferences[K]) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <NativeSelect
          id="topic"
          value={value.topic}
          onChange={(e) => update("topic", e.target.value)}
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label>Goal type</Label>
        <OptionCards<GoalType>
          name="goalType"
          options={GOAL_TYPES}
          value={value.goalType}
          onChange={(goalType) => update("goalType", goalType)}
          hints={GOAL_TYPE_HINTS}
        />
      </div>

      <div className="space-y-2">
        <Label>Commitment level</Label>
        <OptionCards<CommitmentLevel>
          name="commitment"
          options={COMMITMENT_LEVELS}
          value={value.commitment}
          onChange={(commitment) => update("commitment", commitment)}
          hints={COMMITMENT_HINTS}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={value.deadline}
          onChange={(e) => update("deadline", e.target.value)}
          className="h-10 bg-card"
        />
      </div>
    </>
  );
}

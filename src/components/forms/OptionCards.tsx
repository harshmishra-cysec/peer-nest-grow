import { cn } from "@/lib/utils";

interface OptionCardsProps<T extends string> {
  name: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  hints?: Partial<Record<T, string>>;
}

/** Radio group rendered as selectable cards — used for goal, commitment, skill. */
export function OptionCards<T extends string>({
  name,
  options,
  value,
  onChange,
  hints,
}: OptionCardsProps<T>) {
  return (
    <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const selected = option === value;
        return (
          <label
            key={option}
            className={cn(
              "cursor-pointer rounded-lg border p-3 transition-colors",
              selected ? "border-primary bg-primary-soft" : "border-input bg-card hover:bg-accent",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span className="block text-sm font-semibold">{option}</span>
            {hints?.[option] && (
              <span className="mt-0.5 block text-xs text-muted-foreground">{hints[option]}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

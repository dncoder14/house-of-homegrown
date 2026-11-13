import { Minus, Plus } from "lucide-react"
import { cn } from "../../lib/utils"

const QuantityStepper = ({ value, onChange, min = 1, max = 20, size = "md", label = "Quantity", className }) => {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11"
  const btn = cn(
    dim,
    "flex items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
  )
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center overflow-hidden rounded-lg border border-input bg-surface", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className={cn("num min-w-[2.5rem] text-center text-sm font-semibold", size === "sm" && "min-w-[2rem]")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export { QuantityStepper }

import { cn } from "../../lib/utils"

/** Centered message for empty lists, failed loads and zero-result searches. */
const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center", className)}>
    {Icon && (
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    )}
    <h2 className="text-2xl">{title}</h2>
    {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
  </div>
)

export { EmptyState }

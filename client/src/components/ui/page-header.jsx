import { cn } from "../../lib/utils"

/** Standard page title block: title, optional supporting line, optional actions on the right. */
const PageHeader = ({ title, description, actions, className, children }) => (
  <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
    <div className="min-w-0">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
)

export { PageHeader }

import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

/** items: [{ label, to? }] — the last item is the current page. */
const Breadcrumbs = ({ items, className }) => (
  <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
    <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.to && !last ? (
              <Link to={item.to} className="rounded-sm transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current={last ? "page" : undefined} className={cn(last && "font-medium text-foreground")}>
                {item.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  </nav>
)

export { Breadcrumbs }

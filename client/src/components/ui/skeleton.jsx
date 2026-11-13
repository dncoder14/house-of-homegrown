import { cn } from "../../lib/utils"

const Skeleton = ({ className, ...props }) => (
  <div aria-hidden="true" className={cn("skeleton", className)} {...props} />
)

export { Skeleton }

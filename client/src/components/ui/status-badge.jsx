import { Badge } from "./badge"

const STATUS_VARIANT = {
  Placed: "info",
  Processing: "warning",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "destructive",
}

const StatusBadge = ({ status, className }) => (
  <Badge variant={STATUS_VARIANT[status] || "muted"} className={className}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {status}
  </Badge>
)

export { StatusBadge }

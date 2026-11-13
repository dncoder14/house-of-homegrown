import { cn } from "../../lib/utils"

export const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`

const Price = ({ value, className }) => <span className={cn("num font-semibold", className)}>{formatPrice(value)}</span>

export { Price }

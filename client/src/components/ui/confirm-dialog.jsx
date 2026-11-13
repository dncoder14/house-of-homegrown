import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog"
import { Button } from "./button"

/** Replaces window.confirm: themed, focus-trapped, and shows progress while the action runs. */
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  destructive = false,
  loading = false,
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
    <DialogContent>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{cancelLabel}</Button>
        <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </DialogContent>
  </Dialog>
)

export { ConfirmDialog }

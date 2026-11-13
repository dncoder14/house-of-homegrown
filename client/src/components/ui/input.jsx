import * as React from "react"
import { cn } from "../../lib/utils"

const fieldBase =
  "flex w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground shadow-soft placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/25"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />
))
Input.displayName = "Input"

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[96px] py-2.5", className)} {...props} />
))
Textarea.displayName = "Textarea"

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(fieldBase, "h-11 cursor-pointer appearance-none pr-9", className)}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  </div>
))
Select.displayName = "Select"

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("mb-1.5 block text-sm font-medium text-foreground", className)} {...props} />
))
Label.displayName = "Label"

/** Label + control + helper/error text wired together for screen readers. */
const Field = ({ label, htmlFor, error, hint, required, className, children }) => (
  <div className={className}>
    {label && (
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </Label>
    )}
    {children}
    {error ? (
      <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-1.5 text-[0.8125rem] text-destructive">
        {error}
      </p>
    ) : hint ? (
      <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="mt-1.5 text-[0.8125rem] text-muted-foreground">
        {hint}
      </p>
    ) : null}
  </div>
)

export { Input, Textarea, Select, Label, Field }

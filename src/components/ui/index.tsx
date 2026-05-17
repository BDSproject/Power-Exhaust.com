import * as React from "react";
import { cn } from "@/lib/utils";
import { XCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

// ─── Button ───────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-exhaust-orange hover:bg-exhaust-orange-dark text-white shadow-lg",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/20",
    outline: "border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-exhaust-orange hover:bg-exhaust-orange/10",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-exhaust-orange/50 focus:ring-offset-2 focus:ring-offset-exhaust-dark",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  className,
  label,
  error,
  hint,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-300"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-sm",
          "bg-white/8 text-white placeholder:text-gray-500",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-exhaust-orange/40 focus:border-exhaust-orange",
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-white/20 hover:border-white/40",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  className,
  label,
  error,
  options,
  placeholder,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-300"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-sm",
          "bg-white/8 text-white",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-exhaust-orange/40 focus:border-exhaust-orange",
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-white/20 hover:border-white/40",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-gray-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-sm",
          "bg-white/8 text-white placeholder:text-gray-500",
          "transition-all duration-200 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-exhaust-orange/40 focus:border-exhaust-orange",
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-white/20 hover:border-white/40",
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className, glass }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm",
        glass
          ? "bg-white/80 backdrop-blur-md border-white/50"
          : "bg-[#121212] border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5 border-b border-white/10", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-t border-white/10 bg-white/5 rounded-b-2xl", className)}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-gray-700 text-white border-gray-700",
    success: "bg-green-600 text-white border-green-600",
    warning: "bg-amber-500 text-white border-amber-500",
    danger: "bg-red-600 text-white border-red-600",
    info: "bg-blue-600 text-white border-blue-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Alert ────────────────────────────────────
interface AlertProps {
  children: React.ReactNode;
  type?: "error" | "success" | "warning" | "info";
  className?: string;
}

export function Alert({ children, type = "info", className }: AlertProps) {
  const styles = {
    error:   "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    error:   <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
    info:    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-sm",
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

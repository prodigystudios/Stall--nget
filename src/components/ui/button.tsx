import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

type ButtonBaseProps = {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonProps = ButtonBaseProps & ComponentPropsWithoutRef<"button">;
type LinkButtonProps = ButtonBaseProps & ComponentPropsWithoutRef<typeof Link>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-[0_14px_34px_-18px_rgba(107,66,38,0.8)] hover:bg-accent-strong",
  secondary:
    "bg-white text-foreground border border-border hover:bg-[#f1e5d8]",
  ghost: "bg-transparent text-foreground hover:bg-white/70",
  danger: "bg-[#8b3d2e] text-white hover:bg-[#713123]",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const commonStyles =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55";

export function Button({
  asChild,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps | LinkButtonProps) {
  const classes = cn(commonStyles, variantStyles[variant], sizeStyles[size], className);

  if (asChild && "href" in props) {
    return (
      <Link {...props} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...(props as ButtonProps)} className={classes}>
      {children}
    </button>
  );
}
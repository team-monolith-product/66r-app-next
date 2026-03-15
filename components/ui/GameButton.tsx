"use client";

import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-9  px-5  text-sm",
  md: "h-12 px-7  text-base",
  lg: "h-14 px-8  text-lg",
};

const variantClasses: Record<Variant, string> = {
  primary:   "game-btn-primary",
  secondary: "game-btn-secondary",
  ghost:     "game-btn-ghost",
  danger:    "game-btn-danger",
};

export default function GameButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: GameButtonProps) {
  return (
    <button
      className={[
        "game-btn",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

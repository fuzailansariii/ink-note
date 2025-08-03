"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary";
  title?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  isSubmitting?: boolean;
}

const variantStyles = {
  primary:
    "bg-neutral-900 hover:ring-neutral-600 hover:bg-neutral-700 text-white",
  secondary: "hover:ring-neutral-600 text-neutral-300",
};

export default function Button({
  variant = "primary", // set default to "primary"
  title,
  className,
  onClick,
  type = "button",
  children,
  isSubmitting,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "font-quicksand cursor-pointer rounded-lg border border-neutral-700 px-4 py-2 text-sm transition duration-200 ease-in-out hover:ring-1 md:text-base",
        variantStyles[variant],
        isSubmitting && "cursor-not-allowed opacity-50",
        className,
      )}
      disabled={isSubmitting}
    >
      {children || title}
    </button>
  );
}

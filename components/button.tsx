"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
  title?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  isSubmitting?: boolean;
}

export default function Button({
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
        "flex justify-center items-center gap-2 px-6 py-2 w-full border rounded-md shadow-lg font-quicksand font-semibold transition hover:bg-gray-100",
        className
      )}
      disabled={isSubmitting}
    >
      {children || title}
    </button>
  );
}

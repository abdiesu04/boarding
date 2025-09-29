// src/components/ui/badge.tsx
import React from "react";
import clsx from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "destructive";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex px-2 py-1 rounded-full font-medium text-xs";

  const variantStyles: Record<string, string> = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    secondary: "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
    destructive:
      "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100",
  };

  return (
    <span className={clsx(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};

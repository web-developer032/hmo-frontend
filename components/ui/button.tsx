import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      asChild = false,
      type = "button",
      ...props
    },
    ref
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        disabled={disabled}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          {
            xs: "h-7 rounded-[5px] px-2.5 text-[0.72rem]",
            sm: "h-9 rounded-md px-3.5 text-sm",
            md: "h-10 rounded-md px-4.5 text-sm",
            lg: "h-11 rounded-md px-5 text-base",
          }[size],
          {
            primary: "bg-primary text-primary-foreground hover:bg-(--accent-2)",
            secondary:
              "border border-(--border-strong) bg-card text-foreground shadow-sm hover:bg-(--paper-2)",
            outline:
              "border border-border bg-transparent text-foreground hover:bg-(--surface)",
            ghost: "text-foreground hover:bg-(--surface)",
            danger: "bg-(--red-light) text-(--red) hover:bg-[#fad5d2]",
          }[variant],
          className
        )}
        {...props}
      />
    );
  }
);

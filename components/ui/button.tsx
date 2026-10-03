import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-ink text-white hover:bg-[#292d31] focus-visible:outline-ink",
        variant === "secondary" &&
          "border border-line bg-white text-ink hover:border-[#b8bec5] hover:bg-[#fafafa] focus-visible:outline-arb",
        variant === "quiet" && "text-ink hover:bg-black/5 focus-visible:outline-arb",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

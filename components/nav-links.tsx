"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Product" },
  { href: "/docs", label: "Docs" },
  { href: "/proof", label: "Proof" },
  { href: "/break", label: "Security" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
      className={cn(
        "rounded-sm transition hover:text-ink",
        pathname === link.href && "text-ink underline decoration-arb decoration-2 underline-offset-8",
      )}
    >
      {link.label}
    </Link>
  ));
}

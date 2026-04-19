"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspaceNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  className?: string;
  compact?: boolean;
};

export function SidebarNav({ className, compact = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-2", compact ? "overflow-x-auto pb-1" : "flex-col", className)}>
      {workspaceNavigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex min-w-[13rem] items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
              compact && "min-w-[12rem] shrink-0",
              isActive
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
                isActive
                  ? "bg-white/10 text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span
                className={cn(
                  "block text-xs leading-5",
                  isActive ? "text-slate-300" : "text-slate-500",
                )}
              >
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

import type { ReactNode } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(203,213,225,0.35),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden w-[320px] shrink-0 border-r border-slate-200/80 px-8 py-10 lg:flex lg:flex-col">
          <Link href="/" className="space-y-4">
            <Badge variant="outline" className="w-fit bg-white/70">
              Physique Accountability
            </Badge>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  PA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Accountability Engine
                  </p>
                  <p className="text-sm text-slate-500">
                    Structured coaching ops for execution-focused clients.
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                This shell separates public marketing from the internal coaching
                workspace so we can add auth later without restructuring routes.
              </p>
            </div>
          </Link>

          <div className="mt-10 flex-1">
            <SidebarNav />
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Initial scope
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Daily and weekly check-ins, accountability scores, reminder
              escalation, and structured weekly summaries.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="mb-8 space-y-4 lg:hidden">
            <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white/85 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Physique Accountability
                </p>
                <p className="text-sm text-slate-500">
                  Coaching workspace foundation
                </p>
              </div>
              <Badge variant="outline">v0 foundation</Badge>
            </div>
            <SidebarNav compact />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

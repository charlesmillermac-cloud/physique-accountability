import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarCheck2,
  ClipboardList,
  Gauge,
  History,
  Settings,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const workspaceNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Scorecards, cadence, and alerts.",
    icon: Gauge,
  },
  {
    href: "/onboarding",
    label: "Onboarding",
    description: "Set accountability expectations.",
    icon: Activity,
  },
  {
    href: "/daily-check-in",
    label: "Daily Check-In",
    description: "Capture daily compliance inputs.",
    icon: CalendarCheck2,
  },
  {
    href: "/weekly-check-in",
    label: "Weekly Check-In",
    description: "Review weekly trends and feedback.",
    icon: ClipboardList,
  },
  {
    href: "/review-history",
    label: "Review History",
    description: "Inspect prior accountability cycles.",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Configure scoring and reminders.",
    icon: Settings,
  },
];

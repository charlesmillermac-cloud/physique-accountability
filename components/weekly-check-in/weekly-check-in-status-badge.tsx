import { Badge } from "@/components/ui/badge";
import {
  getWeeklyCheckInStatusLabel,
  type WeeklyCheckInDisplayStatus,
} from "@/lib/weekly-check-in";

type WeeklyCheckInStatusBadgeProps = {
  status: WeeklyCheckInDisplayStatus;
};

export function WeeklyCheckInStatusBadge({
  status,
}: WeeklyCheckInStatusBadgeProps) {
  if (status === "completed") {
    return <Badge variant="success">{getWeeklyCheckInStatusLabel(status)}</Badge>;
  }

  if (status === "partial") {
    return <Badge variant="default">{getWeeklyCheckInStatusLabel(status)}</Badge>;
  }

  return <Badge variant="outline">{getWeeklyCheckInStatusLabel(status)}</Badge>;
}

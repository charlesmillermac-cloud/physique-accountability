import { Badge } from "@/components/ui/badge";
import {
  getDailyCheckInStatusLabel,
  type DailyCheckInDisplayStatus,
} from "@/lib/daily-check-in";

type DailyCheckInStatusBadgeProps = {
  status: DailyCheckInDisplayStatus;
};

export function DailyCheckInStatusBadge({
  status,
}: DailyCheckInStatusBadgeProps) {
  if (status === "completed") {
    return <Badge variant="success">{getDailyCheckInStatusLabel(status)}</Badge>;
  }

  if (status === "partial") {
    return <Badge variant="default">{getDailyCheckInStatusLabel(status)}</Badge>;
  }

  return <Badge variant="outline">{getDailyCheckInStatusLabel(status)}</Badge>;
}

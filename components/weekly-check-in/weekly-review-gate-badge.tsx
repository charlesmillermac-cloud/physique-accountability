import { Badge } from "@/components/ui/badge";
import {
  getWeeklyReviewGateStatusLabel,
  type WeeklyReviewGateStatus,
} from "@/lib/weekly-check-in";

type WeeklyReviewGateBadgeProps = {
  status: WeeklyReviewGateStatus;
};

export function WeeklyReviewGateBadge({
  status,
}: WeeklyReviewGateBadgeProps) {
  if (status === "completed") {
    return <Badge variant="success">{getWeeklyReviewGateStatusLabel(status)}</Badge>;
  }

  if (status === "overdue") {
    return <Badge variant="warning">{getWeeklyReviewGateStatusLabel(status)}</Badge>;
  }

  return <Badge variant="default">{getWeeklyReviewGateStatusLabel(status)}</Badge>;
}

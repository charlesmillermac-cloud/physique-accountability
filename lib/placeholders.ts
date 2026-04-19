export const dashboardMetrics = [
  {
    label: "Compliance score",
    value: "84",
    suffix: "/100",
    detail: "Rolling seven-day score from training, nutrition, and recovery inputs.",
  },
  {
    label: "Reporting consistency",
    value: "91",
    suffix: "/100",
    detail: "Submission reliability across required daily and weekly checkpoints.",
  },
  {
    label: "Missing required data",
    value: "2",
    suffix: " items",
    detail: "Open data gaps currently blocking a fully confident weekly review.",
  },
] as const;

export const dashboardCadence = [
  {
    title: "Daily check-in",
    status: "Submitted",
    note: "Today at 6:42 AM",
  },
  {
    title: "Weekly check-in",
    status: "Due tomorrow",
    note: "Requires biofeedback, photos, and plan adherence notes.",
  },
  {
    title: "Reminder queue",
    status: "Escalation level 1",
    note: "Automatic follow-up triggers after one missed daily submission.",
  },
] as const;

export const missingDataItems = [
  "Morning bodyweight for Thursday check-in",
  "Weekly progress photos for the current review window",
  "Energy score trend for the last 3 daily submissions",
] as const;

export const summaryHighlights = [
  "Training execution remained strong through the middle of the week, with one late missed submission reducing reporting confidence.",
  "Recovery data suggests slightly elevated fatigue heading into the weekend, so sleep consistency is the main watch item.",
  "Nutrition adherence stayed within target range and should be reflected positively in the next weekly summary.",
] as const;

export const historySnapshots = [
  {
    window: "Apr 8 to Apr 14",
    compliance: "86/100",
    reporting: "95/100",
    summary: "High execution week with one minor recovery dip and no critical data gaps.",
  },
  {
    window: "Apr 1 to Apr 7",
    compliance: "79/100",
    reporting: "88/100",
    summary: "Strong start, but two missing morning weigh-ins reduced summary quality.",
  },
  {
    window: "Mar 25 to Mar 31",
    compliance: "82/100",
    reporting: "92/100",
    summary: "Consistent training adherence and improved weekly reflection quality.",
  },
] as const;

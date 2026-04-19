import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  suffix?: string;
  detail: string;
};

export function MetricCard({ label, value, suffix, detail }: MetricCardProps) {
  return (
    <Card className="bg-slate-950 text-white">
      <CardHeader className="pb-4">
        <CardDescription className="text-slate-400">{label}</CardDescription>
        <CardTitle className="flex items-end gap-2 text-4xl text-white">
          {value}
          {suffix ? (
            <span className="pb-1 text-sm font-medium text-slate-400">{suffix}</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-start gap-3 text-sm leading-6 text-slate-300">
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
        <p>{detail}</p>
      </CardContent>
    </Card>
  );
}

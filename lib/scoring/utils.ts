import type { ScoreComponentResult } from "@/lib/scoring/types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function toPercentage(ratio: number) {
  return roundToTwoDecimals(clamp(ratio, 0, 1) * 100);
}

export function safeRatio(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

export function sumAvailableWeight(components: ScoreComponentResult[]) {
  return components.reduce((sum, component) => {
    return component.score === null ? sum : sum + component.weight;
  }, 0);
}

export function weightedAverage(components: ScoreComponentResult[]) {
  const availableWeight = sumAvailableWeight(components);

  if (availableWeight <= 0) {
    return null;
  }

  const weightedSum = components.reduce((sum, component) => {
    if (component.score === null) {
      return sum;
    }

    return sum + component.score * component.weight;
  }, 0);

  return roundToTwoDecimals(weightedSum / availableWeight);
}

export function weightedCoverage(components: ScoreComponentResult[]) {
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);

  if (totalWeight <= 0) {
    return 0;
  }

  const weightedSum = components.reduce((sum, component) => {
    return sum + component.weight * (component.coverage / 100);
  }, 0);

  return weightedSum / totalWeight;
}

export function dateValueFromUtcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDateValueInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseUtcDateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function differenceInDaysInclusive(startDateValue: string, endDateValue: string) {
  const start = parseUtcDateValue(startDateValue);
  const end = parseUtcDateValue(endDateValue);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
}

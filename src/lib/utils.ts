import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string) {
  // Append T12:00:00 to date-only strings (YYYY-MM-DD) so they are parsed as
  // local noon rather than UTC midnight — prevents a 1-day rollback in
  // UTC-offset timezones (e.g. US/Eastern shows Apr 6 instead of Apr 7).
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? dateString + "T12:00:00"
    : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(normalized));
}

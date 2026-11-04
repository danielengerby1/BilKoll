const TIME_ZONE = "Europe/Stockholm";

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const slotFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateSv(date: Date): string {
  return dateFormatter.format(date);
}

export function formatSlotSv(date: Date): string {
  return slotFormatter.format(date);
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

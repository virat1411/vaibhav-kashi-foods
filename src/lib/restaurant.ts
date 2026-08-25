import { OpeningHours, RestaurantOpenStatus, RestaurantSettings } from "@prisma/client";

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isWithinHours(now: Date, hours?: Pick<OpeningHours, "openTime" | "closeTime" | "isClosed">) {
  if (!hours || hours.isClosed) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const open = minutes(hours.openTime);
  const close = minutes(hours.closeTime);
  if (close > open) {
    return current >= open && current < close;
  }
  return current >= open || current < close;
}

export function isRestaurantAcceptingOrders(
  settings: Pick<RestaurantSettings, "openStatus" | "useScheduledHours">,
  hours: Array<Pick<OpeningHours, "dayOfWeek" | "openTime" | "closeTime" | "isClosed">>,
  now = new Date(),
) {
  if (settings.openStatus === RestaurantOpenStatus.CLOSED) {
    return { open: false, reason: "CLOSED_MANUAL" as const };
  }
  if (!settings.useScheduledHours) {
    return { open: true, reason: "OPEN_MANUAL" as const };
  }
  const today = hours.find((h) => h.dayOfWeek === now.getDay());
  if (!isWithinHours(now, today)) {
    return { open: false, reason: "CLOSED_HOURS" as const };
  }
  return { open: true, reason: "OPEN_HOURS" as const };
}

export function pincodeAllowed(pincode: string, zones: { isActive: boolean; pincodes: string[] }[]) {
  const cleaned = pincode.replace(/\s/g, "");
  const active = zones.filter((z) => z.isActive);
  if (active.length === 0) return true;
  const listed = active.flatMap((z) => z.pincodes);
  if (listed.length === 0) return true;
  return listed.includes(cleaned);
}

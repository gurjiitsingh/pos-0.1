import { Timestamp, FieldValue } from "firebase/firestore";

export function formatDateUTC(
  date:
    | Timestamp
    | FieldValue
    | string
    | number
    | Date
    | null
    | undefined,
  locale: string = "en-GB"
): string {
  if (!date) return "";

  const timeZoneMap: Record<string, string> = {
    "de-DE": "Europe/Berlin",
    "en-IN": "Asia/Kolkata",
    "en-US": "America/New_York",
    "en-GB": "Europe/London",
    "en-CA": "America/Toronto",
    "en-AU": "Australia/Sydney",
    "ja-JP": "Asia/Tokyo",
  };

  const timeZone =
    timeZoneMap[locale] ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  let dateObj: Date | null = null;

  // 🔥 Firestore Timestamp
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  }
  // 🔥 JS Date
  else if (date instanceof Date) {
    dateObj = date;
  }
  // 🔥 string / number
  else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
}

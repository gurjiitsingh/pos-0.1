import { Timestamp } from "firebase/firestore";

export function formatDateTimeStamp(
  date: string | number | Timestamp | undefined,
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

  let dateObj: Date;

  // 🔥 Firestore Timestamp (UTC → Date)
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  }
  // 🔥 string or number
  else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
}

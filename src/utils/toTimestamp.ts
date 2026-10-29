import { Timestamp } from "firebase/firestore";

/**
 * Converts ISO string OR "YYYY-MM-DD HH:mm" → Firestore Timestamp
 */
export function toTimestamp(
  value?: string | null
): Timestamp | null {
  if (!value) return null;

  // Case 1: ISO string (RECOMMENDED)
  if (value.includes("T")) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return Timestamp.fromDate(d);
  }

  // Case 2: Legacy "YYYY-MM-DD HH:mm"
  if (value.includes(" ")) {
    const [date, time] = value.split(" ");
    if (!time) return null;

    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;

    const d = new Date(date);
    d.setHours(h, m, 0, 0);

    return Timestamp.fromDate(d);
  }

  return null;
}

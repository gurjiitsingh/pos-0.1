// utils/date.ts
import { Timestamp } from "firebase/firestore";

/**
 * Converts "YYYY-MM-DD HH:mm" → Firestore Timestamp
 */
export function toTimestamp(dateTime: string): Timestamp {
  const [date, time] = dateTime.split(" ");
  const [h, m] = time.split(":").map(Number);

  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  return Timestamp.fromDate(d);
}

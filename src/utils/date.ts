import { Timestamp } from "firebase/firestore";

export function formatFirestoreDateToIST(
  createdAt: string | Timestamp | { seconds: number } | null | undefined
): string {
  if (!createdAt) return "";

  let date: Date | null = null;

  // Firestore Timestamp (client / admin)
  if (createdAt instanceof Timestamp) {
    date = createdAt.toDate();
  }

  // Serialized Timestamp (Next.js / JSON)
  else if (
    typeof createdAt === "object" &&
    "seconds" in createdAt
  ) {
    date = new Date(createdAt.seconds * 1000);
  }

  // Already a string
  else if (typeof createdAt === "string") {
    date = new Date(createdAt);
  }

  if (!date || isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// utils/format.ts

/**
 * Converts a price string (like "12,50" or "12.50") to a number.
 * Handles comma as decimal separator (common in German/European input).
 */
export function formatPriceStringToNumber(input: string | FormDataEntryValue | null): number {
  if (!input || typeof input !== "string") return 0;

  // Replace comma with dot and remove non-numeric characters except dot
  const normalized = input.replace(",", ".").replace(/[^0-9.]/g, "");

  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : price;
}

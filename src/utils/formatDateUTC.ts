export function formatDateUTC(
  dateStr: string | number | undefined,
  locale: string = "en-GB"
): string {
  if (!dateStr) return "";

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
    timeZoneMap[locale] || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateObj = typeof dateStr === "string" || typeof dateStr === "number"
    ? new Date(dateStr)
    : null;

  if (!dateObj || isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
}



// export function formatDateUTC(
//   dateStr: string | undefined,
//   locale: string = process.env.NEXT_PUBLIC_DEFAULT_LOCALE as string
// ) {
//   if (!dateStr) return "";

// const timeZoneMap: Record<string, string> = {
//   "de-DE": "Europe/Berlin",        // Germany
//   "en-IN": "Asia/Kolkata",         // India
//   "en-US": "America/New_York",     // United States (Eastern Time)
//   "en-GB": "Europe/London",        // United Kingdom
//   "en-CA": "America/Toronto",      // Canada (Eastern Time)
//   "en-AU": "Australia/Sydney",     // Australia (Sydney Time)
//   "ja-JP": "Asia/Tokyo",           // Japan
// };


//   const timeZone = timeZoneMap[locale] || Intl.DateTimeFormat().resolvedOptions().timeZone;

//   return new Date(dateStr).toLocaleString(locale, {
//     dateStyle: "medium",
//     timeStyle: "short",
//     timeZone,
//   });
// }




// export function formatDateUTC(
//   dateStr: string | undefined,
//   locale: string | number //= "de-DE"
// ) {
//   if (!dateStr) return "";
//   return new Date(dateStr).toLocaleString(String(locale), {
//     dateStyle: "medium",
//     timeStyle: "short",
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//   });
// }


// export function formatDateUTC(dateStr: string | undefined, locale: string) {
//   if (!dateStr) return "";
//   return new Date(dateStr).toLocaleString(locale, {
//     dateStyle: "medium",
//     timeStyle: "short",
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//   });
// }
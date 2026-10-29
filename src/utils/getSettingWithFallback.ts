type FallbackValue = string | undefined | null;

/**
 * Returns the value from primary source (`settings`), or falls back to static text.
 */
export function getSettingWithFallback(
  primary?: FallbackValue,
  fallback?: FallbackValue
): string {
  return typeof primary === 'string' && primary.trim().length > 0
    ? primary
    : fallback ?? '';
}

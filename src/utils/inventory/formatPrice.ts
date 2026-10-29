export function formatNumber(value?: number, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

export function formatPrice(price?: number) {
  return `₹${formatNumber(price)}`;
}

export function formatNumberS(value?: number, decimals = 3) {
  return Number(value || 0).toFixed(decimals);
}

export function formatPriceS(price?: number) {
  return `₹${formatNumberS(price)}`;
}
// // src/utils/formatCurrency.ts
// export function formatCurrencyNumber(
//   amount: number,
//   currency: string,
//   locale: string
// ): string {
//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency,
//   }).format(amount);
// }


export function formatCurrencyNumber(
  amount: number,
  currency?: string,
  locale?: string
): string {
  const defaultCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ;
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ;
  

  const cur = currency ?? defaultCurrency;
  const loc = locale ?? defaultLocale;

  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

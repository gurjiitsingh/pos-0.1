export function displayStock(
  currentStock: number,
  purchaseUnit: string,
  consumptionUnit: string,
  conversionFactor: number
) {
  // Same unit
  if (purchaseUnit === consumptionUnit) {
    return `${currentStock} ${consumptionUnit}`;
  }

  // Fix floating-point issues
  const safeStock = Math.round(currentStock * 1000) / 1000;

  // ✅ If less than one purchase unit, show only consumption unit
  if (safeStock < conversionFactor) {
    return `${safeStock} ${consumptionUnit}`;
  }

  const wholeUnits = Math.floor(safeStock / conversionFactor);

  let remaining =
    Math.round((safeStock % conversionFactor) * 1000) / 1000;

  let result = `${wholeUnits} ${purchaseUnit}`;

  const isContainerUnit =
  purchaseUnit !== "kg" &&
  purchaseUnit !== "gm" &&
  purchaseUnit !== "ltr" &&
  purchaseUnit !== "ml";

if (
  isContainerUnit &&
  conversionFactor > 1000 &&
  consumptionUnit === "gm"
) {
  if (remaining >= 1000) {
    const kg = Math.floor(remaining / 1000);
    remaining = remaining % 1000;

    result += ` ${kg} kg`;
  }
}

  if (remaining > 0.001) {
    result += ` ${remaining} ${consumptionUnit}`;
  }

  return result;
}


// export function displayStock(
//   currentStock: number,
//   purchaseUnit: string,
//   consumptionUnit: string,
//   conversionFactor: number
// ) {
//   // Same unit
//   if (
//     purchaseUnit === consumptionUnit
//   ) {
//     return `${currentStock} ${consumptionUnit}`;
//   }

//   // ✅ FIX FLOAT ISSUES
//   const safeStock = Math.round(
//     currentStock * 1000
//   ) / 1000;

//   const wholeUnits = Math.floor(
//     safeStock / conversionFactor
//   );

//   const remainingRaw =
//     safeStock % conversionFactor;

//   // ✅ ROUND REMAINING
//   const remaining =
//     Math.round(remainingRaw * 1000) /
//     1000;

//   let result = "";

//   if (wholeUnits > 0) {
//     result += `${wholeUnits} ${purchaseUnit}`;
//   }

//   // avoid 0.00000000001 issue
//   if (remaining > 0.001) {
//     result += ` ${remaining} ${consumptionUnit}`;
//   }

//   return `${result} (${safeStock} ${consumptionUnit})`;
// }


// export function displayStock(
//   currentStock: number,
//   purchaseUnit: string,
//   consumptionUnit: string,
//   conversionFactor: number
// ) {
//   // Same unit
//   if (
//     purchaseUnit === consumptionUnit
//   ) {
//     return `${currentStock} ${consumptionUnit}`;
//   }

//   const wholeUnits = Math.floor(
//     currentStock / conversionFactor
//   );

//   const remaining =
//     currentStock % conversionFactor;

//   let result = "";

//   if (wholeUnits > 0) {
//     result += `${wholeUnits} ${purchaseUnit}`;
//   }

//   if (remaining > 0) {
//     result += ` ${remaining} ${consumptionUnit}`;
//   }

//   return `${result} (${currentStock} ${consumptionUnit})`;
// }
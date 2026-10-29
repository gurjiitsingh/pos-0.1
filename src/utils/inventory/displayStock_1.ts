export function displayStock_1(
  currentStock: number,
  purchaseUnit: string,
  consumptionUnit: string,
  conversionFactor: number
) {
  // Same unit
  if (purchaseUnit === consumptionUnit) {
    return `${currentStock} ${consumptionUnit}`;
  }

  let remainAfterConvertToPurchaseUnit = 0;
  let toConvertToPurchaseUnit = 0;

  let valueInPurchaseUnit = 0;
  let valueInKg = 0;
  let valueInGm = 0;

  let valueInLtr = 0;
  let valueInMl = 0;

  let totalGmToConvert = currentStock;
  let totalMlToConvert = currentStock;

  // =====================================================
  // GM CONSUMPTION UNIT
  // =====================================================

  if (consumptionUnit === "gm") {

    // Only convert GM -> purchase unit
    // when purchase unit is NOT KG.
    if (
      currentStock >= conversionFactor &&
      purchaseUnit !== "kg"
    ) {
      remainAfterConvertToPurchaseUnit =
        currentStock % conversionFactor;

      toConvertToPurchaseUnit =
        currentStock -
        remainAfterConvertToPurchaseUnit;

      valueInPurchaseUnit =
        toConvertToPurchaseUnit /
        conversionFactor;

      totalGmToConvert =
        remainAfterConvertToPurchaseUnit;
    }

    // =================================================
    // Remaining GM -> KG
    // =================================================

    if (totalGmToConvert >= 1000) {
      const gmRemainder =
        totalGmToConvert % 1000;

      valueInKg =
        (totalGmToConvert - gmRemainder) /
        1000;

      totalGmToConvert = gmRemainder;
    }

    // =================================================
    // Remaining GM
    // =================================================

    if (totalGmToConvert > 0) {
      valueInGm = totalGmToConvert;
    }
  }

  // =====================================================
  // ML CONSUMPTION UNIT
  // =====================================================

  if (consumptionUnit === "ml") {

    // Only convert ML -> purchase unit
    // when purchase unit is NOT LTR.
    if (
      currentStock >= conversionFactor &&
      purchaseUnit !== "ltr"
    ) {
      remainAfterConvertToPurchaseUnit =
        currentStock % conversionFactor;

      toConvertToPurchaseUnit =
        currentStock -
        remainAfterConvertToPurchaseUnit;

      valueInPurchaseUnit =
        toConvertToPurchaseUnit /
        conversionFactor;

      totalMlToConvert =
        remainAfterConvertToPurchaseUnit;
    }

    // =================================================
    // Remaining ML -> LTR
    // =================================================

    if (totalMlToConvert >= 1000) {
      const mlRemainder =
        totalMlToConvert % 1000;

      valueInLtr =
        (totalMlToConvert - mlRemainder) /
        1000;

      totalMlToConvert = mlRemainder;
    }

    // =================================================
    // Remaining ML
    // =================================================

    if (totalMlToConvert > 0) {
      valueInMl = totalMlToConvert;
    }
  }

  // =====================================================
  // RESULT
  // =====================================================

  let result = "";

  // Purchase unit
  if (valueInPurchaseUnit > 0) {
    result += `${valueInPurchaseUnit} ${purchaseUnit}`;
  }

  // KG
  if (valueInKg > 0) {
    result += `${result ? " " : ""}${valueInKg} Kg`;
  }

  // GM
  if (valueInGm > 0) {
    result += `${result ? " " : ""}${valueInGm} Gm`;
  }

  // LTR
  if (valueInLtr > 0) {
    result += `${result ? " " : ""}${valueInLtr} L`;
  }

  // ML
  if (valueInMl > 0) {
    result += `${result ? " " : ""}${valueInMl} ml`;
  }

  return result;
}








// export function displayStock_1(
//   currentStock: number,
//   purchaseUnit: string,
//   consumptionUnit: string,
//   conversionFactor: number
// ) {
  

//   // Same unit
//   if (purchaseUnit === consumptionUnit) {
//     return `${currentStock} ${consumptionUnit}`;
//   }

//   let remainGmAfterConvertToPurchaseUnit = 0;
//   let gmToConvertToPurchaseUnit = 0;

//   let valueInPurchaseUnit = 0;
//   let valueInKg = 0;
//   let valueInGm = 0;

//   let totalGmToConvert = currentStock;

//   // =====================================================
//   // GM CONSUMPTION UNIT
//   // =====================================================

//   if (consumptionUnit === "gm") {

//     // Only convert GM -> purchase unit
//     // when purchase unit is NOT KG.
//     if (
//       currentStock >= conversionFactor &&
//       purchaseUnit !== "kg"
//     ) {
//       remainGmAfterConvertToPurchaseUnit =
//         currentStock % conversionFactor;

//       gmToConvertToPurchaseUnit =
//         currentStock -
//         remainGmAfterConvertToPurchaseUnit;

//       valueInPurchaseUnit =
//         gmToConvertToPurchaseUnit /
//         conversionFactor;

//       totalGmToConvert =
//         remainGmAfterConvertToPurchaseUnit;
//     }

//     // =================================================
//     // Remaining GM -> KG
//     // =================================================

//     if (totalGmToConvert >= 1000) {
//       const gmRemainder =
//         totalGmToConvert % 1000;

//       valueInKg =
//         (totalGmToConvert - gmRemainder) /
//         1000;

//       totalGmToConvert = gmRemainder;
//     }

//     // =================================================
//     // Remaining GM
//     // =================================================

//     if (totalGmToConvert > 0) {
//       valueInGm = totalGmToConvert;
//     }
//   }

//   // =====================================================
//   // RESULT
//   // =====================================================

//   let result = "";

//   if (valueInPurchaseUnit > 0) {
//     result += `${valueInPurchaseUnit} ${purchaseUnit}`;
//   }

//   if (valueInKg > 0) {
//     result += `${result ? " " : ""}${valueInKg} Kg`;
//   }

//   if (valueInGm > 0) {
//     result += `${result ? " " : ""}${valueInGm} Gm`;
//   }

//   return result;
// }


export function display7Stock(
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


     if(conversionFactor > 1000){
    if(consumptionUnit == "gm"){
 if (remaining > 1000) {
  remaining =  Math.round((safeStock % conversionFactor)  ) / 1000;
    result += ` ${remaining} Kg`;
    remaining =   Math.round((safeStock % 1000) ) ;
  }

    }
  }


  if (remaining > 0.001) {
    result += ` ${remaining} ${consumptionUnit}`;
  }

  return result;
}



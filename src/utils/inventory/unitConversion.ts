// src/lib/utils/unitConversion.ts

import { InventoryUnit } from "@/lib/types/InventoryItemType";

export type UnitOption = {
  unit: string;
  factor: number;
};

export const UNIT_PAIRS: Record<string, UnitOption[]> = {
  kg: [
    { unit: "kg", factor: 1 },
    { unit: "gm", factor: 1000 },
  ],

  gm: [{ unit: "gm", factor: 1 }],

  ltr: [
    { unit: "ltr", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  ml: [{ unit: "ml", factor: 1 }],

  dozen: [
    { unit: "dozen", factor: 1 },
    { unit: "pcs", factor: 12 },
    { unit: "bottle", factor: 12 },
    { unit: "can", factor: 12 },
  ],

  pair: [
    { unit: "pair", factor: 1 },
    { unit: "pcs", factor: 2 },
  ],

  carton: [
    { unit: "carton", factor: 1 },
    { unit: "pcs", factor: 24 },
    { unit: "bottle", factor: 24 },
    { unit: "can", factor: 24 },
  ],

  box: [
    { unit: "box", factor: 1 },
    { unit: "pcs", factor: 10 },
  ],

  pack: [
    { unit: "pack", factor: 1 },
    { unit: "pcs", factor: 6 },
  ],

  bag: [
    { unit: "bag", factor: 1 },
    { unit: "gm", factor: 5000 },
  ],

  bottle: [
    { unit: "bottle", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  can: [
    { unit: "can", factor: 1 },
    { unit: "ml", factor: 330 },
  ],

  jar: [
    { unit: "jar", factor: 1 },
    { unit: "gm", factor: 500 },
  ],

  tray: [
    { unit: "tray", factor: 1 },
    { unit: "pcs", factor: 30 },
  ],

  roll: [
    { unit: "roll", factor: 1 },
    { unit: "pcs", factor: 1 },
  ],

  pcs: [{ unit: "pcs", factor: 1 }],
};


// 👉 Get all consumption options based on purchase unit
export function getConsumptionOptions_(purchaseUnit: string): UnitOption[] {
  return UNIT_PAIRS[purchaseUnit] || [];
}

export type UnitPair = {
  purchaseUnit: InventoryUnit;
  consumptionUnit: InventoryUnit;
};
// 👉 Get conversion factor
export function getConversionFactor(
  purchaseUnit: string,
  consumptionUnit: string
): number {
  const options = UNIT_PAIRS[purchaseUnit] || [];

  const found = options.find(
    (o) => o.unit === consumptionUnit
  );

  return found ? found.factor : 1;
}


// 👉 Get default pair (first option)
export function getDefaultUnitPair(
  purchaseUnit?: InventoryUnit
): UnitPair | null {
  if (!purchaseUnit) return null;

  switch (purchaseUnit) {
    case "dozen":
      return { purchaseUnit: "dozen", consumptionUnit: "pcs" };

    case "kg":
      return { purchaseUnit: "kg", consumptionUnit: "gm" };

    case "ltr":
      return { purchaseUnit: "ltr", consumptionUnit: "ml" };

    default:
      return { purchaseUnit, consumptionUnit: purchaseUnit };
  }
}
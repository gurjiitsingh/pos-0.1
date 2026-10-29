import { InventoryItemType } from "@/lib/types/InventoryItemType";

type InventoryWithMappings = Pick<
  InventoryItemType,
  "purchaseMappings" | "consumptionUnit"
>;

export function getPrimaryPurchaseMapping(
  item: InventoryWithMappings
) {
  return (
    item.purchaseMappings?.[0] ?? {
      purchaseUnit: item.consumptionUnit,
      consumptionUnit: item.consumptionUnit,
      factor: 1,
    }
  );
}


export function getDisplayAverageCost(
  item: Pick<
    InventoryItemType,
    "averageCost" | "purchaseMappings" | "consumptionUnit"
  >
) {
  const mapping = getPrimaryPurchaseMapping(item);

  return mapping.factor === 1
    ? Number(item.averageCost ?? 0)
    : Number(item.averageCost ?? 0) *
        mapping.factor;
}
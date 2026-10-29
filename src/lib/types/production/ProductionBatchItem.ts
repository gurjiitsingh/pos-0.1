export type ProductionBatchItem = {
  id: string;

  batchId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;
  unit: string;

  costPerUnit: number;
  totalCost: number;

  createdAt: number;
};
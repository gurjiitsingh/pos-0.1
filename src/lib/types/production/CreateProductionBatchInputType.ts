export type CreateProductionBatchInputType = {
  departmentId: string;
  departmentName: string;
managerName?:string;
  // add this
  employeeCount?: number;

  note?: string;

  items: {
    inventoryItemId: string;
    inventoryItemName: string;

    quantity: number;

    purchaseUnit: string;
    consumptionUnit: string;

    purchaseUnitCost: number;
    conversionFactor: number;

    averageCost: number;
    costPerUnit: number;
  }[];
};
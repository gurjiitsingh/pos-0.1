export type ProductionBatchType = {
  id: string;

  departmentId: string;
  departmentName: string;

  outputQty: number;

  batchCost: number;
  avgCostPerUnit: number;
  sellingPrice: number;

  employeeCount: number;

  note: string;
  status: "OPEN" | "CLOSED" | string;

  startTime: number | null;
  endTime: number | null;

  durationHours: number;
  laborHours: number;
};
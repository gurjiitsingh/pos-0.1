export type ProductionBatch = {
  id: string; // batchId (AUTO)
  departmentId: string;
  departmentName: string;

  createdAt: number;
  createdBy?: string;

  note?: string;

  isClosed?: boolean; // later when production done
};
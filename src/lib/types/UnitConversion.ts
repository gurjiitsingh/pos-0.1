export type UnitConversion = {
  id: string;
  purchaseUnit: string;
  consumptionUnit: string;
  factor: number;
  isActive?: boolean;
  system?: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;

  type?: string;
  isEditable?: boolean;
};
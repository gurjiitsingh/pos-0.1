import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

type PaymentMethod = "CASH" | "UPI" | "CARD";

export type ApplyInventoryTansactrionType = {
  inventoryItemId: string;

  type: InventoryTransactionNameType;
  direction: "IN" | "OUT";

  quantity: number;

  unitCost: number;

  purchaseQuantity: number;
  purchaseUnit: InventoryUnit;
  purchaseUnitCost: number;

  conversionFactor: number;

  supplierId?: string;
  supplierName?: string;

  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;

  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;

  referenceType?: "MANUAL" | "PURCHASE" | "SALE";
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: string;
};
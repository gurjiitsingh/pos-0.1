export type PosCartEntity = {
  // Auto-increment in SQLite
  id?: number;

  productId: string;
  productMode: string;

  currentStock: number;

  name: string;

  categoryId: string;
  categoryName: string;

  parentId?: string | null;

  isVariant: boolean;

  basePrice: number;

  finalPrice: number;

  modifierTotal: number;

  quantity: number;

  taxRate: number;

  taxType: string;

  // POS session
  sessionId: string;

  // Dine-in table
  tableId?: string | null;
  tableName?: string | null;

  createdById?: string;
  createdByName?: string;

  // Kitchen note
  note?: string;

  // JSON string of modifiers
  modifiersJson?: string;

  // Kitchen workflow
  sentToKitchen: boolean;

  kitchenPrintReq: boolean;

  printStatus: 'PENDING' | 'PRINTED' | 'FAILED';

  createdAt: number;
};
export type InventoryTransactionPurchaseType = {
    inventoryItemId: string;

    type: string;
    direction: "IN" | "OUT";

    quantity: number;     
     
    purchaseQuantity: number;
    purchaseUnit: string;
    purchaseUnitCost: number;
    conversionFactor: number;

   
    supplierId?: string;
    supplierName: string;

    paymentMethod?: string | null;

    referenceType?: string;
    referenceId?: string;

    note?: string;
    createdBy?: string;

    source?: string;
};

export type ApplyInventoryTransactionType = {
    inventoryItemId: string;

    type: string;
    direction: "IN" | "OUT";

    quantity: number;

    unitCost?: number;
stockValue?: number;
    purchaseQuantity?: number;
    purchaseUnit?: string;
    purchaseUnitCost?: number;
    conversionFactor?: number;

    supplierId?: string;
    supplierName?: string;

    totalAmount?: number;
    paidAmount?: number;
    dueAmount?: number;
    paymentStatus?: string;
    paymentMethod?: string | null;

    referenceType?: string;
    referenceId?: string;

    note?: string;
    createdBy?: string;

    source?: string;
};
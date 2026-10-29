export interface KitchenPrintData {
  kotNumber: string;
  tableNo: string;
  tableName: string;
  orderType: string;
  createdAt: number;
  items: {
    name: string;
    quantity: number;
    note?: string;
  }[];
}

export interface BillPrintData {
  invoiceNo: string;
  tableNo?: string;
  createdAt: number;
  paymentMode: string;
  items: {
    name: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paid: number;
  due: number;
}

export interface BarPrintData {
  tokenNo: string;
  createdAt: number;
  items: {
    name: string;
    qty: number;
  }[];
}
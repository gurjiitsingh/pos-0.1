export type PosOrderMasterEntity = {
  id: string;
  srno: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'ONLINE';
  tableNo?: string | null;

  saleType?: string | null;
  reason?: string | null;

  customerName?: string | null;
  customerPhone?: string | null;
  customerId?: string | null;

  createdById?: string | null;
  createdByName?: string | null;

  finalizedById?: string | null;
  finalizedByName?: string | null;

  dAddressLine1?: string | null;
  dAddressLine2?: string | null;
  dCity?: string | null;
  dState?: string | null;
  dZipcode?: string | null;
  dLandmark?: string | null;

  deliveryFee: number;
  deliveryTax: number;
  itemTotal: number;
  itemTax: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;

  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'ONLINE' | 'CREDIT' | 'MIXED';
  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT' | 'NEW';

  paidAmount: number;
  dueAmount: number;

  orderStatus:
    | 'NEW'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

  source: 'POS' | 'WEB' | 'APP';

  deviceId: string;
  deviceName?: string | null;
  appVersion?: string | null;

  businessDate: string;

  createdAt: number;
  updatedAt?: number | null;

  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  lastSyncedAt?: number | null;

  notes?: string | null;
};
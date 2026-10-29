import { Timestamp, FieldValue } from "firebase/firestore";
 

export type orderPaymentT = {
  id: string;

  ownerId: string;
  outletId: string;

  orderId: string;
  customerId?: string;

  amount: number;

  mode: "CASH" | "CARD" | "UPI" | "ONLINE";

  provider?: string;
  method?: string;

  status: "SUCCESS" | "FAILED" | "REFUNDED";

  createdAt: Timestamp | FieldValue;

  deviceId?: string;
  syncedFrom: "POS" | "WEB";
};

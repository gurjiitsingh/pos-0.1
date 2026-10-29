import { Timestamp, FieldValue } from "firebase/firestore";
 

export type customerT = {
  id: string;

  ownerId: string;
  outletId: string;

  linkedUserId?: string; // Firebase Auth UID

  name: string;
  phone: string;
  countryCode?: string;
  email?: string;

  // Default Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  landmark?: string;

  // Credit Control
  creditLimit: number;
  currentDue: number;

  totalOrders: number;
  totalSpent: number;

  lastOrderAt?: Timestamp;

  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

import { PrinterRole } from './types';

export interface PrintJob<T = any> {
  id: string;

  role: PrinterRole;

  data: T;

  createdAt: number;

  copies?: number;

  source?: 'POS' | 'WAITER' | 'SYSTEM';
}
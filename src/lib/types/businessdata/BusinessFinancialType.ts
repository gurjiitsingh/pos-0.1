// lib/types/BusinessAccountType.ts

export type BusinessFinancialType = {
  cashInHand: number;
  cashInBank: number;

  expenseDue: number;
  loans: number;

  updatedAt?: number;
};
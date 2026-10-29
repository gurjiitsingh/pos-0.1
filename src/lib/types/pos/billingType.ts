export type TaxType = 'inclusive' | 'exclusive';

export type TaxMode =
  | 'PER_ITEM'
  | 'FORCE_INCLUSIVE'
  | 'FORCE_EXCLUSIVE';

export interface BillItemInput {
  productId?: string;
  name?: string;
  quantity: number;
  discountEligible: boolean;
  basePrice: number;
  taxRate: number;
  taxType: TaxType;
}

export interface BillCalculationResult {
  itemSubtotalPaise: number;

  exclusiveTaxPaise: number;
  inclusiveTaxPaise: number;
  totalTaxPaise: number;

  discountPaise: number;

  deliveryFeePaise: number;
  deliveryTaxPaise: number;

  grandTotalPaise: number;
}
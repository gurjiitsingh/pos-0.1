
import { BillCalculationResult, BillItemInput, TaxMode, TaxType } from '@/lib/types/pos/billingType';
import { fromPaise, toPaise } from './money';

// =====================================================
// TAX HELPERS
// =====================================================

function effectiveTaxType(outletTaxMode: TaxMode, itemTaxType: TaxType): TaxType {
  switch (outletTaxMode) {
    case 'FORCE_INCLUSIVE': return 'inclusive';
    case 'FORCE_EXCLUSIVE': return 'exclusive';
    default: return itemTaxType;
  }
}

function resolveDeliveryTaxRate(items: BillItemInput[], deliveryTaxPercent: number): number {
  if (deliveryTaxPercent > 0) return deliveryTaxPercent;
  return items[0]?.taxRate ?? 0;
}

// =====================================================
// GST BILL CALCULATION
// =====================================================

export function calculateBillAndroid(params: {
  items: BillItemInput[];
  taxMode?: TaxMode;
  discountFlat?: number;
  discountPercent?: number;
  deliveryFee?: number;
  deliveryTaxPercent?: number;
}): BillCalculationResult {
  
  const {
    items,
    taxMode = 'PER_ITEM',
    discountFlat = 0,
    discountPercent = 0,
    deliveryFee = 0,
    deliveryTaxPercent = 0,
  } = params;

  // ITEM SUBTOTAL
  const itemSubtotalPaise = items.reduce(
    (sum, item) => sum + toPaise(item.basePrice) * item.quantity,
    0
  );

  // DISCOUNT-ELIGIBLE SUBTOTAL
  const eligibleSubtotalPaise = items.reduce(
    (sum, item) => item.discountEligible === false
      ? sum
      : sum + toPaise(item.basePrice) * item.quantity,
    0
  );

  // RAW TAX
  let exclusiveTaxPaise = 0;
  let inclusiveTaxPaise = 0;
  let eligibleExclusiveTaxPaise = 0;
  let eligibleInclusiveTaxPaise = 0;

    items.map((item) => {
    const basePaise = toPaise(item.basePrice);
    const quantity = Number(item.quantity || 0);
    const taxType = effectiveTaxType(taxMode, item.taxType);

    let taxPerItemPaise = 0;

    if (taxType === 'exclusive') {
      taxPerItemPaise = Math.round(basePaise * item.taxRate / 100);
    } else if (taxType === 'inclusive') {
      taxPerItemPaise = Math.round(basePaise * item.taxRate / (100 + item.taxRate));
    }

    const itemTaxPaise = taxPerItemPaise * quantity;
    const discountEligible = item.discountEligible !== false;

    if (taxType === 'exclusive') {
      exclusiveTaxPaise += itemTaxPaise;
      if (discountEligible) eligibleExclusiveTaxPaise += itemTaxPaise;
    } else {
      inclusiveTaxPaise += itemTaxPaise;
      if (discountEligible) eligibleInclusiveTaxPaise += itemTaxPaise;
    }

  });

  // DISCOUNT
  const flatPaise = toPaise(discountFlat);
  const percentPaise = Math.round(eligibleSubtotalPaise * discountPercent / 100);
  const requestedDiscountPaise = flatPaise > 0 ? flatPaise : percentPaise;

  const safeDiscountPaise = Math.min(
    Math.max(0, requestedDiscountPaise),
    eligibleSubtotalPaise
  );

   const taxableAmountPaise =
    itemSubtotalPaise - safeDiscountPaise;

  const discountRatio = eligibleSubtotalPaise > 0
    ? safeDiscountPaise / eligibleSubtotalPaise
    : 0;

  exclusiveTaxPaise -= Math.round(eligibleExclusiveTaxPaise * discountRatio);
  inclusiveTaxPaise -= Math.round(eligibleInclusiveTaxPaise * discountRatio);

  // DELIVERY
  const deliveryFeePaise = toPaise(deliveryFee);
  const deliveryRate = resolveDeliveryTaxRate(items, deliveryTaxPercent);
  const deliveryTaxPaise = Math.round(deliveryFeePaise * deliveryRate / 100);

  // TOTAL TAX
  const totalTaxPaise = exclusiveTaxPaise + inclusiveTaxPaise + deliveryTaxPaise;

  // GRAND TOTAL
  const grandTotalPaise = itemSubtotalPaise - safeDiscountPaise
    + exclusiveTaxPaise + deliveryFeePaise + deliveryTaxPaise;

  console.log("itemSubtotalPaise------------------------------", itemSubtotalPaise)
  console.log(" totalTaxPaise------------------------------", totalTaxPaise)
  console.log("grandtototal------------------------------", grandTotalPaise)
  return {
    itemSubtotalPaise,
taxableAmountPaise,
    exclusiveTaxPaise,

    inclusiveTaxPaise,

    totalTaxPaise,

    discountPaise:
      safeDiscountPaise,

    deliveryFeePaise,

    deliveryTaxPaise,

    grandTotalPaise,
  };
  


}

// =====================================================
// LIQUOR VAT + CESS CALCULATION
// =====================================================


export function calculateBillLiquorVat(params: {
  items: BillItemInput[];
  taxType?: TaxType;
  discountFlat?: number;
  discountPercent?: number;
}) {
  const {
    items,
    discountFlat = 0,
    discountPercent = 0,
  } = params;

  // ITEM SUBTOTAL
  const itemSubtotalPaise = items.reduce(
    (sum, item) =>
      sum + toPaise(item.basePrice) * Number(item.quantity || 0),
    0
  );

  // DISCOUNT-ELIGIBLE SUBTOTAL
  const eligibleSubtotalPaise = items.reduce(
    (sum, item) =>
      item.discountEligible === false
        ? sum
        : sum + toPaise(item.basePrice) * Number(item.quantity || 0),
    0
  );

  // VAT + CESS
  let vatPaise = 0;
  let cessPaise = 0;

  // DISPLAY ONLY
  let vatPaiseForDisplay = 0;
  let cessPaiseForDisplay = 0;

  let eligibleVatPaise = 0;
  let eligibleCessPaise = 0;

  const vatRate = Number(items[0]?.taxRate || 0);
  const cessRate = Number(items[0]?.taxRate1 || 0);

  // CALCULATE FROM ITEMS
  const calculatedItems = items.map((item) => {
    const basePaise = toPaise(item.basePrice);
    const quantity = Number(item.quantity || 0);

    const itemVatRate = Number(item.taxRate || 0);
    const itemCessRate = Number(item.taxRate1 || 0);

    // VAT FOR DISPLAY (INCLUSIVE AND EXCLUSIVE)
    const itemVatPaiseForDisplay = Math.round(
      basePaise * itemVatRate / 100
    );

    // CESS FOR DISPLAY (CALCULATED ON VAT)
    const itemCessPaiseForDisplay = Math.round(
      itemVatPaiseForDisplay * itemCessRate / 100
    );

    const totalVatPaiseForDisplay =
      itemVatPaiseForDisplay * quantity;

    const totalCessPaiseForDisplay =
      itemCessPaiseForDisplay * quantity;

    // ACCUMULATE DISPLAY TOTALS
    vatPaiseForDisplay += totalVatPaiseForDisplay;
    cessPaiseForDisplay += totalCessPaiseForDisplay;

    // ACTUAL VAT AND CESS CALCULATION
    let itemVatPaise = 0;
    let itemCessPaise = 0;

    if (item.taxType === 'exclusive') {
      itemVatPaise = Math.round(
        basePaise * itemVatRate / 100
      );

      itemCessPaise = Math.round(
        itemVatPaise * itemCessRate / 100
      );
    }

    const totalVatPaise = itemVatPaise * quantity;
    const totalCessPaise = itemCessPaise * quantity;

    const discountEligible = item.discountEligible !== false;

    vatPaise += totalVatPaise;
    cessPaise += totalCessPaise;

    if (discountEligible) {
      eligibleVatPaise += totalVatPaise;
      eligibleCessPaise += totalCessPaise;
    }

    // RETURN INDIVIDUAL ITEM
    return {
      productId: item.productId,
      name: item.name,
      quantity,

      basePricePaise: basePaise,
      subtotalPaise: basePaise * quantity,

      vatRate: itemVatRate,
      cessRate: itemCessRate,

      vatPerItemPaise: itemVatPaise,
      cessPerItemPaise: itemCessPaise,

      vatPaise: totalVatPaise,
      cessPaise: totalCessPaise,

      vatPaiseForDisplay: totalVatPaiseForDisplay,
      cessPaiseForDisplay: totalCessPaiseForDisplay,

      taxPaise: totalVatPaise + totalCessPaise,

      discountEligible,
    };
  });

  // DISCOUNT
  const flatPaise = toPaise(discountFlat);

  const percentPaise = Math.round(
    eligibleSubtotalPaise * discountPercent / 100
  );

  const requestedDiscountPaise =
    flatPaise > 0 ? flatPaise : percentPaise;

  const safeDiscountPaise = Math.min(
    Math.max(0, requestedDiscountPaise),
    eligibleSubtotalPaise
  );

  // TAXABLE AMOUNT AFTER DISCOUNT
  const taxableAmountPaise =
    itemSubtotalPaise - safeDiscountPaise;

// REDUCE ACTUAL VAT AND CESS PROPORTIONATELY
const discountRatio = eligibleSubtotalPaise > 0
  ? safeDiscountPaise / eligibleSubtotalPaise
  : 0;

vatPaise -= Math.round(
  eligibleVatPaise * discountRatio
);

cessPaise -= Math.round(
  eligibleCessPaise * discountRatio
);

// REDUCE DISPLAY VAT AND CESS PROPORTIONATELY
const eligibleDisplayVatPaise = calculatedItems
  .filter(item => item.discountEligible)
  .reduce(
    (sum, item) => sum + item.vatPaiseForDisplay,
    0
  );

const eligibleDisplayCessPaise = calculatedItems
  .filter(item => item.discountEligible)
  .reduce(
    (sum, item) => sum + item.cessPaiseForDisplay,
    0
  );

vatPaiseForDisplay -= Math.round(
  eligibleDisplayVatPaise * discountRatio
);

cessPaiseForDisplay -= Math.round(
  eligibleDisplayCessPaise * discountRatio
);

  // TOTAL TAX
  const totalTaxPaise = vatPaise + cessPaise;

  // GRAND TOTAL
  const grandTotalPaise =
    taxableAmountPaise + totalTaxPaise;

  // RETURN COMPLETE BILL
  return {
    itemSubtotalPaise,
    discountPaise: safeDiscountPaise,
    taxableAmountPaise,

    vatRate,
    vatPaise,

    cessRate,
    cessPaise,

    // DISPLAY TOTALS BEFORE DISCOUNT
    vatPaiseForDisplay,
    cessPaiseForDisplay,

    totalTaxPaise,
    grandTotalPaise,

    items: calculatedItems,
  };
}





export { fromPaise, toPaise };

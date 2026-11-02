
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

  const calculatedItems = items.map((item) => {
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

    return {
      productId: item.productId,
      name: item.name,
      quantity,
      basePricePaise: basePaise,
      subtotalPaise: basePaise * quantity,
      taxType,
      taxRate: item.taxRate,
      taxPerItemPaise,
      taxPaise: itemTaxPaise,
      discountEligible,
    };
  });

  // DISCOUNT
  const flatPaise = toPaise(discountFlat);
  const percentPaise = Math.round(eligibleSubtotalPaise * discountPercent / 100);
  const requestedDiscountPaise = flatPaise > 0 ? flatPaise : percentPaise;

  const safeDiscountPaise = Math.min(
    Math.max(0, requestedDiscountPaise),
    eligibleSubtotalPaise
  );

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
    console.log(" totalTaxPaise------------------------------",  totalTaxPaise)
console.log("grandtototal------------------------------", grandTotalPaise)
return {
    itemSubtotalPaise,

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
    taxType = 'exclusive',
    discountFlat = 0,
    discountPercent = 0,
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

  // RAW VAT + CESS
  let vatPaise = 0;
  let cessPaise = 0;
  let eligibleVatPaise = 0;
  let eligibleCessPaise = 0;

  const calculatedItems = items.map((item) => {
    const basePaise = toPaise(item.basePrice);
    const quantity = Number(item.quantity || 0);
    const vatRate = Number(item.taxRate || 0);
    const cessRate = Number(item.taxRate1 || 0);

    let itemVatPaise = 0;
    let itemCessPaise = 0;

    if (taxType === 'exclusive') {
      itemVatPaise = Math.round(basePaise * vatRate / 100);
      itemCessPaise = Math.round(basePaise * cessRate / 100);
    } else if (taxType === 'inclusive') {
      const combinedRate = vatRate + cessRate;
      if (combinedRate > 0) {
        itemVatPaise = Math.round(basePaise * vatRate / (100 + combinedRate));
        itemCessPaise = Math.round(basePaise * cessRate / (100 + combinedRate));
      }
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

    return {
      productId: item.productId,
      name: item.name,
      quantity,
      basePricePaise: basePaise,
      subtotalPaise: basePaise * quantity,
      taxType,
      vatRate,
      cessRate,
      vatPerItemPaise: itemVatPaise,
      cessPerItemPaise: itemCessPaise,
      vatPaise: totalVatPaise,
      cessPaise: totalCessPaise,
      taxPaise: totalVatPaise + totalCessPaise,
      discountEligible,
    };
  });

  // DISCOUNT
  const flatPaise = toPaise(discountFlat);
  const percentPaise = Math.round(eligibleSubtotalPaise * discountPercent / 100);
  const requestedDiscountPaise = flatPaise > 0 ? flatPaise : percentPaise;

  const safeDiscountPaise = Math.min(
    Math.max(0, requestedDiscountPaise),
    eligibleSubtotalPaise
  );

  const discountRatio = eligibleSubtotalPaise > 0
    ? safeDiscountPaise / eligibleSubtotalPaise
    : 0;

  vatPaise -= Math.round(eligibleVatPaise * discountRatio);
  cessPaise -= Math.round(eligibleCessPaise * discountRatio);

  // TOTAL TAX
  const totalTaxPaise = vatPaise + cessPaise;

  // GRAND TOTAL
  const grandTotalPaise = taxType === 'inclusive'
    ? itemSubtotalPaise - safeDiscountPaise
    : itemSubtotalPaise - safeDiscountPaise + totalTaxPaise;

  return {
    itemSubtotalPaise,
    vatPaise,
    cessPaise,
    totalTaxPaise,
    discountPaise: safeDiscountPaise,
    grandTotalPaise,
    items: calculatedItems,
  };
}

export { fromPaise, toPaise };

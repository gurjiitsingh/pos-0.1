import { BillCalculationResult, BillItemInput, TaxMode, TaxType } from '@/lib/types/pos/billingType';
import { fromPaise, toPaise } from './money';
 

function effectiveTaxType(
  outletTaxMode: TaxMode,
  itemTaxType: TaxType
): TaxType {
  switch (outletTaxMode) {
    case 'FORCE_INCLUSIVE':
      return 'inclusive';

    case 'FORCE_EXCLUSIVE':
      return 'exclusive';

    default:
      return itemTaxType;
  }
}

function resolveDeliveryTaxRate(
  items: BillItemInput[],
  deliveryTaxPercent: number
): number {
  if (deliveryTaxPercent > 0) {
    return deliveryTaxPercent;
  }

  const firstItem = items[0];

  return firstItem?.taxRate ?? 0;
}


export function calculateBillAndroid(
  params: {
    items: BillItemInput[];
    taxMode?: TaxMode;
    discountFlat?: number;
    discountPercent?: number;
    deliveryFee?: number;
    deliveryTaxPercent?: number;
  }
): BillCalculationResult {
  
  const {
    items,
    taxMode = 'PER_ITEM',
    discountFlat = 0,
    discountPercent = 0,
    deliveryFee = 0,
    deliveryTaxPercent = 0,
  } = params;
console.log("items------------------",items)
  // =========================
  // ITEM SUBTOTAL
  // Includes ALL items
  // =========================
  const itemSubtotalPaise = items.reduce(
    (sum, item) =>
      sum + toPaise(item.basePrice) * item.quantity,
    0
  );

  // =========================
  // ELIGIBLE ITEM SUBTOTAL
  // Includes ONLY discount-eligible items
  // =========================
  const eligibleSubtotalPaise = items.reduce(
    (sum, item) => {
      if (item.discountEligible === false) {
        return sum;
      }

      return (
        sum + toPaise(item.basePrice) * item.quantity
      );
    },
    0
  );

  // =========================
  // RAW TAX
  // Calculate tax for ALL items
  // =========================
  let exclusiveTaxPaise = 0;
  let inclusiveTaxPaise = 0;

  let eligibleExclusiveTaxPaise = 0;
  let eligibleInclusiveTaxPaise = 0;

  for (const item of items) {
    const basePaise = toPaise(item.basePrice);

    const taxType = effectiveTaxType(
      taxMode,
      item.taxType
    );

    let taxPerItem = 0;

    if (taxType === 'exclusive') {
      taxPerItem = Math.round(
        (basePaise * item.taxRate) / 100
      );
    } else if (taxType === 'inclusive') {
      taxPerItem = Math.round(
        (basePaise * item.taxRate) /
          (100 + item.taxRate)
      );
    }

    const itemTaxPaise =
      taxPerItem * item.quantity;

    if (taxType === 'exclusive') {
      exclusiveTaxPaise += itemTaxPaise;
    } else {
      inclusiveTaxPaise += itemTaxPaise;
    }

    // Track tax separately for eligible items.
    if (item.discountEligible === true) {
      if (taxType === 'exclusive') {
        eligibleExclusiveTaxPaise += itemTaxPaise;
      } else {
        eligibleInclusiveTaxPaise += itemTaxPaise;
      }
    }
  }

  // =========================
  // DISCOUNT
  // Only eligible items receive a discount
  // =========================
  const flatPaise = toPaise(discountFlat);

  const percentPaise = Math.round(
    (eligibleSubtotalPaise * discountPercent) / 100
  );

  // Flat discount takes priority over percentage.
  const requestedDiscountPaise =
    flatPaise > 0 ? flatPaise : percentPaise;

  // Discount cannot exceed the eligible subtotal.
  const safeDiscountPaise = Math.min(
    Math.max(0, requestedDiscountPaise),
    eligibleSubtotalPaise
  );

  // Calculate the discount proportion for eligible items.
  const discountRatio =
    eligibleSubtotalPaise > 0
      ? safeDiscountPaise / eligibleSubtotalPaise
      : 0;

  // Reduce tax ONLY for eligible items.
  exclusiveTaxPaise -= Math.round(
    eligibleExclusiveTaxPaise * discountRatio
  );

  inclusiveTaxPaise -= Math.round(
    eligibleInclusiveTaxPaise * discountRatio
  );

  // =========================
  // DELIVERY
  // =========================
  const deliveryFeePaise = toPaise(deliveryFee);

  const deliveryRate = resolveDeliveryTaxRate(
    items,
    deliveryTaxPercent
  );

  const deliveryTaxPaise = Math.round(
    (deliveryFeePaise * deliveryRate) / 100
  );

  const totalTaxPaise =
    exclusiveTaxPaise +
    inclusiveTaxPaise +
    deliveryTaxPaise;

  // =========================
  // GRAND TOTAL
  // Inclusive tax is NOT added again.
  // =========================
  const grandTotalPaise =
    itemSubtotalPaise -
    safeDiscountPaise +
    exclusiveTaxPaise +
    deliveryFeePaise +
    deliveryTaxPaise;

  return {
    itemSubtotalPaise,
    exclusiveTaxPaise,
    inclusiveTaxPaise,
    totalTaxPaise,
    discountPaise: safeDiscountPaise,
    deliveryFeePaise,
    deliveryTaxPaise,
    grandTotalPaise,
  };
}


export { fromPaise, toPaise };
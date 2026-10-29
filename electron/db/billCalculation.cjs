function toPaise(value) {
  return Math.round(Number(value || 0) * 100);
}

function fromPaise(value) {
  return Number(value || 0) / 100;
}

function effectiveTaxType(
  outletTaxMode,
  itemTaxType
) {
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
  items,
  deliveryTaxPercent
) {
  if (deliveryTaxPercent > 0) {
    return deliveryTaxPercent;
  }

  const firstItem = items[0];

  return firstItem?.taxRate ?? 0;
}

function calculateBillAndroid(params) {
  const {
    items,
    taxMode = 'PER_ITEM',
    discountFlat = 0,
    discountPercent = 0,
    deliveryFee = 0,
    deliveryTaxPercent = 0,
  } = params;

  // =====================================================
  // ITEM SUBTOTAL
  // =====================================================

  const itemSubtotalPaise = items.reduce(
    (sum, item) =>
      sum +
      toPaise(item.basePrice) *
        item.quantity,
    0
  );

  // =====================================================
  // RAW TAX
  // =====================================================

  let exclusiveTaxPaise = 0;
  let inclusiveTaxPaise = 0;

  for (const item of items) {
    const basePaise =
      toPaise(item.basePrice);

    const taxType =
      effectiveTaxType(
        taxMode,
        item.taxType
      );

    let taxPerItem = 0;

    if (taxType === 'exclusive') {
      taxPerItem = Math.round(
        (basePaise * item.taxRate) /
          100
      );
    } else if (
      taxType === 'inclusive'
    ) {
      taxPerItem = Math.round(
        (basePaise * item.taxRate) /
          (100 + item.taxRate)
      );
    }

    if (taxType === 'exclusive') {
      exclusiveTaxPaise +=
        taxPerItem * item.quantity;
    } else {
      inclusiveTaxPaise +=
        taxPerItem * item.quantity;
    }
  }

  // =====================================================
  // DISCOUNT
  // =====================================================

  const flatPaise =
    toPaise(discountFlat);

  const percentPaise =
    Math.round(
      (itemSubtotalPaise *
        discountPercent) /
        100
    );

  const discountPaise =
    flatPaise > 0
      ? flatPaise
      : percentPaise;

  const safeDiscountPaise =
    Math.min(
      discountPaise,
      itemSubtotalPaise
    );

  const discountRatio =
    itemSubtotalPaise === 0
      ? 0
      : safeDiscountPaise /
        itemSubtotalPaise;

  exclusiveTaxPaise =
    Math.round(
      exclusiveTaxPaise *
        (1 - discountRatio)
    );

  inclusiveTaxPaise =
    Math.round(
      inclusiveTaxPaise *
        (1 - discountRatio)
    );

  // =====================================================
  // DELIVERY
  // =====================================================

  const deliveryFeePaise =
    toPaise(deliveryFee);

  const deliveryRate =
    resolveDeliveryTaxRate(
      items,
      deliveryTaxPercent
    );

  const deliveryTaxPaise =
    Math.round(
      (deliveryFeePaise *
        deliveryRate) /
        100
    );

  // =====================================================
  // TOTAL TAX
  // =====================================================

  const totalTaxPaise =
    exclusiveTaxPaise +
    inclusiveTaxPaise +
    deliveryTaxPaise;

  // =====================================================
  // GRAND TOTAL
  // =====================================================

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

    discountPaise:
      safeDiscountPaise,

    deliveryFeePaise,

    deliveryTaxPaise,

    grandTotalPaise,
  };
}

module.exports = {
  calculateBillAndroid,
  fromPaise,
  toPaise,
};
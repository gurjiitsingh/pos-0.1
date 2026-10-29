type CalcInput = {
  itemTotal: number;
  deliveryFee?: number;

  // discounts
  couponFlat?: number;
  couponPercent?: number;
  pickupDiscount?: number;

  // tax
  taxBeforeDiscount: number;
};

export function calculateOrderTotals(input: CalcInput) {
  const {
    itemTotal,
    deliveryFee = 0,
    couponFlat = 0,
    couponPercent = 0,
    pickupDiscount = 0,
    taxBeforeDiscount,
  } = input;

  // -----------------------------
  // 1️⃣ TOTAL DISCOUNT
  // -----------------------------
  const discountTotal =
    couponFlat + couponPercent + pickupDiscount;

  // Safety guard
  const safeItemTotal = Math.max(itemTotal, 0);

  // -----------------------------
  // 2️⃣ DISCOUNT RATIO
  // -----------------------------
  const discountRatio =
    safeItemTotal > 0
      ? Math.min(discountTotal / safeItemTotal, 1)
      : 0;

  // -----------------------------
  // 3️⃣ ADJUSTED TAX
  // -----------------------------
  const taxTotal =
    taxBeforeDiscount * (1 - discountRatio);

  // -----------------------------
  // 4️⃣ SUBTOTAL (after discount, before tax)
  // -----------------------------
  const subTotal =
    safeItemTotal - discountTotal;

  // -----------------------------
  // 5️⃣ GRAND TOTAL
  // -----------------------------
  const grandTotal =
    subTotal + taxTotal + deliveryFee;

  return {
    // clean fields (new)
    discountTotal,
    taxBeforeDiscount,
    taxTotal,
    subTotal,
    deliveryFee,
    grandTotal,

    // legacy compatibility (optional but recommended)
    totalTax: taxTotal,
    endTotalG: grandTotal,
    finalGrandTotal: grandTotal,
  };
}

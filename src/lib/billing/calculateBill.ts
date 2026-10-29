export type KitchenItem = {
  id: string;
  tableNo: string;
  productId: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  modifierTotal?: number;
  quantity: number;
  taxRate?: number;
  taxType?: string;
  discountEligible?: boolean;
  note?: string;
  modifiersJson?: string;
};

export function groupBillItems(items: KitchenItem[]) {
  const map = new Map<string, KitchenItem>();

  for (const item of items) {
    const key = [
      item.productId,
      item.basePrice,
      item.taxRate ?? 0,
      item.taxType ?? 'exclusive',
      item.note ?? '',
      item.modifiersJson ?? '',
    ].join('|');

    const existing = map.get(key);

    if (existing) {
      existing.quantity += Number(item.quantity || 0);
    } else {
      map.set(key, {
        ...item,
        quantity: Number(item.quantity || 0),

        // SQLite INTEGER -> Boolean
        // 0 = false, 1 = true
        // Missing/null defaults to true
        discountEligible:
          item.discountEligible == null
            ? true
            : Boolean(item.discountEligible),
      });
    }
  }

  return Array.from(map.values());
}

// export function groupBillItems(items: KitchenItem[]) {
//   const map = new Map<string, KitchenItem>();

//   for (const item of items) {
//     const key = [
//       item.productId,
//       item.basePrice,
//       item.taxRate ?? 0,
//       item.taxType ?? 'exclusive',
//       item.note ?? '',
//       item.modifiersJson ?? '',
//     ].join('|');

//     const existing = map.get(key);

//     if (existing) {
//       existing.quantity += Number(item.quantity || 0);
//     } else {
//       map.set(key, {
//         ...item,
//         quantity: Number(item.quantity || 0),
//       });
//     }
//   }

//   return Array.from(map.values());
// }

// export function groupBillItems(items: KitchenItem[]) {
//   const map = new Map<string, KitchenItem>();

//   for (const item of items) {
//     const key = [
//       item.productId,
//       item.basePrice,
//       item.taxRate ?? 0,
//       item.taxType ?? 'exclusive',
//       item.note ?? '',
//       item.modifiersJson ?? '',
//     ].join('|');

//     const existing = map.get(key);

//     if (existing) {
//       existing.quantity += Number(item.quantity || 0);
//     } else {
//       map.set(key, {
//         ...item,
//         quantity: Number(item.quantity || 0),
//       });
//     }
//   }

//   return Array.from(map.values());
// }

export function calculateBill(
  items: KitchenItem[],
  discount = 0,
  deliveryFee = 0
) {
  let itemSubtotal = 0;
  let itemTax = 0;

  for (const item of items) {
    const quantity = Number(item.quantity) || 0;
    const basePrice = Number(item.basePrice) || 0;
    const modifierPrice = Number(item.modifierTotal) || 0;

    const price = basePrice + modifierPrice;
    const subtotal = price * quantity;

    itemSubtotal += subtotal;

    const taxRate = Number(item.taxRate) || 0;
    const taxType = item.taxType || 'exclusive';

    if (taxType === 'exclusive') {
      itemTax += subtotal * (taxRate / 100);
    }
  }

  const safeDiscount = Math.max(
    0,
    Math.min(discount, itemSubtotal + itemTax)
  );

  const safeDeliveryFee = Math.max(0, deliveryFee);

  const taxableAfterDiscount = Math.max(
    0,
    itemSubtotal + itemTax - safeDiscount
  );

  const grandTotal =
    taxableAfterDiscount + safeDeliveryFee;

  return {
    itemSubtotal: Number(itemSubtotal.toFixed(2)),
    itemTax: Number(itemTax.toFixed(2)),
    discount: Number(safeDiscount.toFixed(2)),
    deliveryFee: Number(safeDeliveryFee.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}
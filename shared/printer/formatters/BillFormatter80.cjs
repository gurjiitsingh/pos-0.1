
class BillFormatter80 {
  format(data = {}) {
    const WIDTH = 48;
    const line = '-'.repeat(WIDTH);

    // =====================================================
    // HELPERS
    // =====================================================

    const text = (value) => String(value ?? '').trim();

    const padRight = (value, length) => {
      const valueText = String(value ?? '');
      return valueText.length >= length
        ? valueText.substring(0, length)
        : valueText + ' '.repeat(length - valueText.length);
    };

    const padLeft = (value, length) => {
      const valueText = String(value ?? '');
      return valueText.length >= length
        ? valueText.substring(0, length)
        : ' '.repeat(length - valueText.length) + valueText;
    };

    const center = (value) => {
      const valueText = String(value ?? '').substring(0, WIDTH);
      const left = Math.floor((WIDTH - valueText.length) / 2);
      return ' '.repeat(left) + valueText;
    };

    const money = (value) => {
      const amount = Number(value ?? 0);
      return (Number.isFinite(amount) ? amount : 0).toFixed(2);
    };

    const cleanLine = (value) => String(value ?? '').substring(0, WIDTH);

    const wrapText = (value, width = WIDTH) => {
      const words = String(value ?? '').trim().split(/\s+/).filter(Boolean);
      const result = [];
      let current = '';

      for (const word of words) {
        if (!current) {
          current = word.substring(0, width);
          if (word.length > width) {
            result.push(current);
            current = '';
          }
          continue;
        }

        if (`${current} ${word}`.length <= width) {
          current += ` ${word}`;
        } else {
          result.push(current);
          current = word.substring(0, width);

          if (word.length > width) {
            result.push(current);
            current = '';
          }
        }
      }

      if (current) result.push(current);
      return result;
    };

    // =====================================================
    // TOTAL LINE
    // =====================================================

    const totalLine = (label, value) =>
      padRight(label, 38) + padLeft(money(value), 10);

    // =====================================================
    // OUTLET HEADER
    // =====================================================

    const buildOutletHeader = (info = {}) => {
      const lines = [];

      const addCentered = (value) => {
        if (text(value)) lines.push(center(value));
      };

      addCentered(info.outletName);
      addCentered(info.addressLine1);
      addCentered(info.addressLine2);
      addCentered(info.addressLine3);
      addCentered(info.city);

      const phone1 = text(info.phone);
      const phone2 = text(info.phone2);

      if (phone1 && phone2) {
        addCentered(`Phone: ${phone1}, ${phone2}`);
      } else if (phone1 || phone2) {
        addCentered(`Phone: ${phone1 || phone2}`);
      }

      addCentered(info.email);
      addCentered(info.web);

      if (text(info.gstVatNumber)) {
        addCentered(`GST No: ${info.gstVatNumber}`);
      }

      return lines.join('\n');
    };

    // =====================================================
    // ORDER TYPE
    // =====================================================

    const getOrderTypeLabel = (orderType) => {
      switch (String(orderType ?? '').toUpperCase()) {
        case 'DINE_IN':
          return 'DINE IN';
        case 'TAKEAWAY':
          return 'TAKEAWAY';
        case 'DELIVERY':
          return 'DELIVERY';
        case 'ONLINE':
          return 'ONLINE';
        default:
          return text(orderType).replace(/_/g, ' ').toUpperCase();
      }
    };

    const buildInvoiceTitle = () => {
      const title = 'TAX INVOICE';
      const orderType = getOrderTypeLabel(data.orderType);
      const spaces = Math.max(1, WIDTH - title.length - orderType.length);

      return title + ' '.repeat(spaces) + orderType;
    };

    // =====================================================
    // ORDER HEADER
    // =====================================================

    const buildHeaderBlock = () => {
      const result = [];

      const orderNo =
        text(data.orderNo) ||
        text(data.billNo) ||
        'PREVIEW';

      const customerName = text(data.customerName) || 'Walk-in';

      let dateTime = text(data.dateTime);

      if (!dateTime) {
        const rawDate = data.createdAt;
        const parsedDate = rawDate ? new Date(rawDate) : new Date();

        if (!Number.isNaN(parsedDate.getTime())) {
          try {
            dateTime = parsedDate.toLocaleString(
              data.outletInfo?.localeTag || undefined
            );
          } catch {
            dateTime = parsedDate.toLocaleString();
          }
        } else {
          dateTime = new Date().toLocaleString();
        }
      }

      result.push(cleanLine(`Invoice No : ${orderNo}`));
      result.push(cleanLine(`Customer   : ${customerName}`));
      result.push(cleanLine(`Date       : ${dateTime}`));

      const orderType = String(data.orderType ?? '').toUpperCase();

      if (orderType === 'DINE_IN') {
        const table = text(data.tableName) || text(data.tableNo);
        const steward = text(data.stewardName);

        if (table && steward) {
          const combined = `Table : ${table}    Steward : ${steward}`;

          if (combined.length <= WIDTH) {
            result.push(combined);
          } else {
            result.push(cleanLine(`Table   : ${table}`));
            result.push(cleanLine(`Steward : ${steward}`));
          }
        } else if (table) {
          result.push(cleanLine(`Table     : ${table}`));
        } else if (steward) {
          result.push(cleanLine(`Steward   : ${steward}`));
        }
      } else if (orderType === 'TAKEAWAY') {
        if (text(data.customerPhone)) {
          result.push(cleanLine(`Phone      : ${data.customerPhone}`));
        }
      } else if (orderType === 'DELIVERY' || orderType === 'ONLINE') {
        const addressLines = [
          data.dAddressLine1,
          data.dAddressLine2,
          data.dLandmark ? `Landmark: ${data.dLandmark}` : '',
          [data.dCity, data.dZipcode].filter(Boolean).join(' '),
        ].filter((value) => text(value));

        if (addressLines.length) {
          result.push('Address   :');

          for (const address of addressLines) {
            result.push(...wrapText(address));
          }
        }

        if (text(data.customerPhone)) {
          result.push(cleanLine(`Phone      : ${data.customerPhone}`));
        }
      }

      return result.join('\n');
    };

    // =====================================================
    // MODIFIERS
    // Supports modifier arrays and modifiersJson containing
    // groups with nested items.
    // =====================================================

    const getModifierNames = (item) => {
      const names = [];

      const visit = (value) => {
        if (Array.isArray(value)) {
          for (const entry of value) visit(entry);
          return;
        }

        if (!value || typeof value !== 'object') {
          if (typeof value === 'string' && text(value)) {
            names.push(text(value));
          }
          return;
        }

        if (text(value.name)) {
          names.push(text(value.name));
          return;
        }

        if (Array.isArray(value.items)) visit(value.items);
        if (Array.isArray(value.groups)) visit(value.groups);
        if (Array.isArray(value.modifiers)) visit(value.modifiers);
      };

      if (Array.isArray(item.modifiers)) {
        visit(item.modifiers);
      } else if (text(item.modifiersJson)) {
        try {
          visit(JSON.parse(item.modifiersJson));
        } catch (error) {
          console.warn(
            '[BillFormatter80] Invalid modifiersJson:',
            error?.message
          );
        }
      }

      return names;
    };

    // =====================================================
    // RECEIPT
    // =====================================================

    const output = [];

    const outletHeader = buildOutletHeader(data.outletInfo);

    if (outletHeader) {
      output.push(outletHeader);
      output.push(line);
    }

    output.push(buildInvoiceTitle());
    output.push(line);
    output.push(buildHeaderBlock());
    output.push(line);

    // =====================================================
    // ITEMS
    // 4 + 26 + 8 + 10 = 48 characters
    // =====================================================

    output.push(
      padRight('QTY', 4) +
      padRight('ITEM', 26) +
      padLeft('PRICE', 8) +
      padLeft('TOTAL', 10)
    );

    output.push(line);

    const items = Array.isArray(data.items) ? data.items : [];

    for (const item of items) {
      const name = text(item?.name) || 'ITEM';
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.price ?? item?.rate ?? 0);

      const amount = Number(
        item?.subtotal ??
        item?.amount ??
        price * quantity
      );

      output.push(
        padRight(quantity, 4) +
        padRight(name.toUpperCase(), 26) +
        padLeft(money(price), 8) +
        padLeft(money(amount), 10)
      );

      for (const modifierName of getModifierNames(item ?? {})) {
        output.push(...wrapText(`    + ${modifierName}`));
      }

      if (text(item?.note)) {
        output.push(...wrapText(`    • ${text(item.note)}`));
      }
    }

    output.push(line);

    
// =====================================================
// TOTALS
// Do not recalculate tax, discounts, or grand total.
// Print the values supplied by the existing POS logic.
// =====================================================

const subtotal = Number(data.subtotal ?? 0);
const discount = Number(data.discount ?? 0);
const deliveryFee = Number(data.deliveryFee ?? 0);
const tax = Number(data.tax ?? 0);
const deliveryTax = Number(data.deliveryTax ?? 0);
const grandTotal = Number(data.grandTotal ?? data.total ?? 0);

output.push(totalLine('Item Total', subtotal));

if (deliveryFee > 0) {
  output.push(totalLine('Delivery', deliveryFee));
}

if (discount > 0) {
  output.push(totalLine('Discount', discount));
}

// =====================================================
// CGST / SGST / ROUNDOFF
// Display only; existing tax calculation remains unchanged.
// =====================================================

const itemTotal = subtotal;
const roundOff = Number(data.roundOff ?? 0);

if (tax > 0) {
  const halfTax = tax / 2;

  output.push(
    totalLine(
      `CGST 2.5% on [${money(grandTotal)}]`,
      halfTax
    )
  );

  output.push(
    totalLine(
      `SGST 2.5% on [${money(grandTotal)}]`,
      halfTax
    )
  );
}

// if (deliveryTax > 0) {
//   output.push(totalLine('Delivery Tax', deliveryTax));
// }

// output.push(totalLine('Round Off', roundOff));
 
    output.push(line);
    output.push(totalLine('TOTAL', grandTotal));
    output.push(line);

    // =====================================================
    // PAYMENT AND CUSTOMER
    // =====================================================

    // if (text(data.paymentMode)) {
    //   output.push(cleanLine(`Payment   : ${data.paymentMode}`));
    // }

    if (
      text(data.customerName) &&
      !['CUSTOMER', 'WALK-IN'].includes(data.customerName.trim().toUpperCase())
    ) {
      output.push(cleanLine(`Customer  : ${data.customerName}`));
    }

    if (text(data.customerPhone)) {
      output.push(cleanLine(`Phone     : ${data.customerPhone}`));
    }

    // =====================================================
    // OUTLET FOOTER
    // =====================================================

    if (text(data.outletInfo?.footerNote)) {
      output.push('');
      output.push(...wrapText(data.outletInfo.footerNote));
      output.push(line);
    }

    output.push('');
    output.push(center('Thank You!'));
    output.push('');
    output.push('');
  

    return output.join('\n');
  }
}

module.exports = {
  BillFormatter80,
};

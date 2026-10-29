
class ReportFormatter {
  constructor(paperSize) {
    // Match the existing 80 mm bill formatter.
    // Adjust to 32 columns for 58 mm printers later if needed.
    this.WIDTH = 48;
  }

  format(data = {}) {
    const WIDTH = this.WIDTH;
    const line = '-'.repeat(WIDTH);

    // =====================================================
    // HELPERS
    // =====================================================

    const text = (value) => String(value ?? '').trim();

    const money = (value) => {
      const amount = Number(value ?? 0);
      return (Number.isFinite(amount) ? amount : 0).toFixed(2);
    };

    const padRight = (value, width) => {
      const s = String(value ?? '');
      return s.length >= width
        ? s.substring(0, width)
        : s + ' '.repeat(width - s.length);
    };

    const padLeft = (value, width) => {
      const s = String(value ?? '');
      return s.length >= width
        ? s.substring(0, width)
        : ' '.repeat(width - s.length) + s;
    };

    const center = (value) => {
      const s = text(value).substring(0, WIDTH);
      const left = Math.floor((WIDTH - s.length) / 2);
      return ' '.repeat(left) + s;
    };

    const wrapText = (value, width = WIDTH) => {
      const words = text(value).split(/\s+/).filter(Boolean);
      const result = [];
      let current = '';

      for (const word of words) {
        if (!current) {
          if (word.length > width) {
            for (let i = 0; i < word.length; i += width) {
              result.push(word.substring(i, i + width));
            }
          } else {
            current = word;
          }
          continue;
        }

        if (`${current} ${word}`.length <= width) {
          current += ` ${word}`;
        } else {
          result.push(current);

          if (word.length > width) {
            for (let i = 0; i < word.length; i += width) {
              result.push(word.substring(i, i + width));
            }
            current = '';
          } else {
            current = word;
          }
        }
      }

      if (current) result.push(current);
      return result;
    };

    const totalLine = (label, value) => {
      const labelWidth = WIDTH - 11;
      return (
        padRight(label, labelWidth) +
        padLeft(money(value), 11)
      );
    };

    const section = (title, output) => {
      output.push('');
      output.push(center(title));
      output.push(line);
    };

    const addRows = (
      output,
      rows,
      getLabel,
      getDetails,
      getAmount
    ) => {
      if (!Array.isArray(rows) || rows.length === 0) {
        output.push('No data');
        return;
      }

      for (const item of rows) {
        output.push(...wrapText(getLabel(item)));

        const details = getDetails(item);
        const amount = getAmount(item);

        output.push(
          padRight(`  ${details}`, WIDTH - 11) +
          padLeft(money(amount), 11)
        );
      }
    };

    // =====================================================
    // OUTLET HEADER
    // =====================================================

    const output = [];
    const outlet = data.outletInfo || {};

    [
      outlet.outletName,
      outlet.addressLine1,
      outlet.addressLine2,
      outlet.addressLine3,
      outlet.city,
    ].forEach((value) => {
      if (text(value)) output.push(center(value));
    });

    const phone = [
      outlet.phone,
      outlet.phone2,
    ].filter((value) => text(value));

    if (phone.length) {
      output.push(center(`Phone: ${phone.join(', ')}`));
    }

    if (text(outlet.gstVatNumber)) {
      output.push(center(`GST No: ${outlet.gstVatNumber}`));
    }

    if (output.length) output.push(line);

    // =====================================================
    // REPORT HEADER
    // =====================================================

    output.push(center(data.reportTitle || 'SALES REPORT'));
    output.push(line);

    output.push(
      ...wrapText(`Business Date: ${data.businessDate || '-'}`)
    );

    let printedAt = text(data.printedAt);

    if (printedAt) {
      const parsed = new Date(printedAt);

      if (!Number.isNaN(parsed.getTime())) {
        printedAt = parsed.toLocaleString(
          outlet.localeTag || 'en-IN'
        );
      }
    }

    if (printedAt) {
      output.push(...wrapText(`Printed: ${printedAt}`));
    }

    output.push(line);

    // =====================================================
    // SALES SUMMARY
    // =====================================================

    const overview = data.overview || {};

    section('SALES SUMMARY', output);

    output.push(
      totalLine('Total Orders', overview.totalOrders)
    );

    output.push(
      totalLine('Total Sales', overview.totalSales)
    );

    output.push(
      totalLine('Total Discount', overview.totalDiscount)
    );

    output.push(
      totalLine('Total Tax', overview.totalTax)
    );

    output.push(
      totalLine('Total Paid', overview.totalPaid)
    );

    output.push(
      totalLine('Total Due', overview.totalDue)
    );

    output.push(line);

    // =====================================================
    // PAYMENT BREAKDOWN
    // =====================================================

    const payments = data.payments || {};

    section('PAYMENT BREAKDOWN', output);

    output.push(totalLine('Cash', payments.cash));
    output.push(totalLine('Card', payments.card));
    output.push(totalLine('UPI', payments.upi));
    output.push(totalLine('Wallet', payments.wallet));
    output.push(totalLine('Credit', payments.credit));

    output.push(line);

    // =====================================================
    // CATEGORY SALES
    // =====================================================

    section('CATEGORY SALES', output);

    addRows(
      output,
      data.categorySales,
      (item) => item.categoryName || 'Uncategorised',
      (item) => `Qty: ${item.quantity ?? 0}`,
      (item) => item.sales
    );

    output.push(line);

    // =====================================================
    // SALES BY ORDER TYPE
    // =====================================================

    section('SALES BY ORDER TYPE', output);

    addRows(
      output,
      data.orderTypeSales,
      (item) => String(item.orderType || 'UNKNOWN')
        .replace(/_/g, ' '),
      (item) => `Orders: ${item.orders ?? 0}`,
      (item) => item.sales
    );

    output.push(line);

    // =====================================================
    // PRODUCT SALES
    // =====================================================

    section('PRODUCT SALES', output);

    addRows(
      output,
      data.productSales,
      (item) => item.productName || 'Unnamed product',
      (item) =>
        `Qty: ${item.quantity ?? 0} | ${item.categoryName || 'Other'}`,
      (item) => item.sales
    );

    output.push(line);

    // =====================================================
    // STAFF SALES
    // =====================================================

    section('STAFF SALES', output);

    addRows(
      output,
      data.staffSales,
      (item) => item.staffName || 'Unknown staff',
      (item) => `Orders: ${item.orders ?? 0}`,
      (item) => item.sales
    );

    output.push(line);

    // =====================================================
    // HOURLY SALES
    // =====================================================

    section('HOURLY SALES', output);

    addRows(
      output,
      data.hourlySales,
      (item) => {
        const hour = Number(item.hour);

        if (!Number.isFinite(hour)) {
          return item.hour || 'Unknown hour';
        }

        const suffix = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:00 ${suffix}`;
      },
      (item) => `Orders: ${item.orders ?? 0}`,
      (item) => item.sales
    );

    output.push(line);
    output.push(center('END OF SALES REPORT'));
    output.push('');
    output.push('');
    output.push('');

    return output.join('\n');
  }
}

module.exports = {
  ReportFormatter,
};

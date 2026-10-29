class BillFormatter80 {
  format(data) {
    const WIDTH = 48;

    const line = '-'.repeat(WIDTH);

    // =====================================================
    // HELPERS
    // =====================================================

    const center = (text) => {
      text = String(text ?? '');

      if (text.length >= WIDTH) {
        return text.substring(0, WIDTH);
      }

      const left = Math.floor(
        (WIDTH - text.length) / 2
      );

      return ' '.repeat(left) + text;
    };

    const padRight = (text, length) => {
      text = String(text ?? '');

      if (text.length >= length) {
        return text.substring(0, length);
      }

      return (
        text +
        ' '.repeat(length - text.length)
      );
    };

    const padLeft = (text, length) => {
      text = String(text ?? '');

      if (text.length >= length) {
        return text.substring(0, length);
      }

      return (
        ' '.repeat(length - text.length) +
        text
      );
    };

    // =====================================================
    // TOTAL LINE
    // Android style:
    //
    // Item Total                              100.00
    // Delivery                                 20.00
    // Discount                                 10.00
    // Tax                                      18.00
    // =====================================================

    const totalLine = (label, value) => {
      return (
        padRight(label, 38) +
        padLeft(
          Number(value || 0).toFixed(2),
          10
        ) +
        '\n'
      );
    };

    // =====================================================
    // OUTLET HEADER
    //
    // Same concept as Android buildOutletHeader()
    // =====================================================

    const buildOutletHeader = (info) => {
      if (!info) {
        return '';
      }

      const lines = [];

      // Outlet name
      if (info.outletName) {
        lines.push(
          center(info.outletName)
        );
      }

      // Address line 1
      if (info.addressLine1) {
        lines.push(
          String(info.addressLine1).substring(
            0,
            WIDTH
          )
        );
      }

      // Address line 2
      if (info.addressLine2) {
        lines.push(
          String(info.addressLine2).substring(
            0,
            WIDTH
          )
        );
      }

      // Address line 3
      if (info.addressLine3) {
        lines.push(
          String(info.addressLine3).substring(
            0,
            WIDTH
          )
        );
      }

      // City
      if (info.city) {
        lines.push(
          String(info.city).substring(
            0,
            WIDTH
          )
        );
      }

      // Phones
      const phone1 =
        info.phone
          ? String(info.phone).trim()
          : '';

      const phone2 =
        info.phone2
          ? String(info.phone2).trim()
          : '';

      if (phone1 && phone2) {
        lines.push(
          `Phone: ${phone1}, ${phone2}`.substring(
            0,
            WIDTH
          )
        );
      } else if (phone1) {
        lines.push(
          `Phone: ${phone1}`.substring(
            0,
            WIDTH
          )
        );
      } else if (phone2) {
        lines.push(
          `Phone: ${phone2}`.substring(
            0,
            WIDTH
          )
        );
      }

      // Email
      if (info.email) {
        lines.push(
          `Email: ${info.email}`.substring(
            0,
            WIDTH
          )
        );
      }

      // Website
      if (info.web) {
        lines.push(
          String(info.web).substring(
            0,
            WIDTH
          )
        );
      }

      // GST
      if (info.gstVatNumber) {
        lines.push(
          `GST: ${info.gstVatNumber}`.substring(
            0,
            WIDTH
          )
        );
      }

      return lines.join('\n');
    };

    // =====================================================
    // HEADER BLOCK
    //
    // Same structure as Android buildHeaderBlock()
    // =====================================================

    const buildHeaderBlock = () => {
      const base = [];

      const orderNo =
        data?.orderNo ||
        data?.billNo ||
        'PREVIEW';

      const customerName =
        data?.customerName &&
        data.customerName.trim()
          ? data.customerName
          : 'Walk-in';

      const dateTime =
        data?.dateTime ||
        (
          data?.createdAt
            ? new Date(
                data.createdAt
              ).toLocaleString()
            : new Date().toLocaleString()
        );

      // ---------------------------------------------------
      // Common fields
      // ---------------------------------------------------

      base.push(
        `Invoice No : ${orderNo}`
      );

      base.push(
        `Customer  : ${customerName}`
      );

      base.push(
        `Date      : ${dateTime}`
      );

      // ---------------------------------------------------
      // Order type specific fields
      // ---------------------------------------------------

      const orderType =
        data?.orderType || '';

      // DINE IN
      if (orderType === 'DINE_IN') {
        const table =
          data?.tableName ||
          data?.tableNo;

        if (table) {
          base.push(
            `Table     : ${table}`
          );
        }
      }

      // TAKEAWAY
      else if (orderType === 'TAKEAWAY') {
        if (
          data?.customerPhone &&
          String(
            data.customerPhone
          ).trim()
        ) {
          base.push(
            `Phone     : ${data.customerPhone}`
          );
        }
      }

      // DELIVERY / ONLINE
      else if (
        orderType === 'DELIVERY' ||
        orderType === 'ONLINE'
      ) {
        const addressLines = [];

        if (data?.dAddressLine1) {
          addressLines.push(
            data.dAddressLine1
          );
        }

        if (data?.dAddressLine2) {
          addressLines.push(
            data.dAddressLine2
          );
        }

        if (data?.dLandmark) {
          addressLines.push(
            `Landmark: ${data.dLandmark}`
          );
        }

        const cityZip = [
          data?.dCity,
          data?.dZipcode,
        ]
          .filter(Boolean)
          .join(' ');

        if (cityZip) {
          addressLines.push(
            cityZip
          );
        }

        if (addressLines.length > 0) {
          base.push('Address  :');

          addressLines.forEach(
            (address) => {
              base.push(
                String(address).substring(
                  0,
                  WIDTH
                )
              );
            }
          );
        }

        if (
          data?.customerPhone &&
          String(
            data.customerPhone
          ).trim()
        ) {
          base.push(
            `Phone     : ${data.customerPhone}`
          );
        }
      }

      return base
        .map((line) =>
          String(line).substring(
            0,
            WIDTH
          )
        )
        .join('\n');
    };

    // =====================================================
    // ITEMS
    // =====================================================

    const items = Array.isArray(data?.items)
      ? data.items
      : [];

    let output = '';

    // =====================================================
    // OUTLET HEADER
    // =====================================================

    const outletHeader =
      buildOutletHeader(
        data?.outletInfo
      );

    if (outletHeader) {
      output += outletHeader;
      output += '\n';
      output += line;
      output += '\n';
    }

    // =====================================================
    // BILL TITLE
    // =====================================================

    output += center('BILL');
    output += '\n';

    output += line;
    output += '\n';

    // =====================================================
    // ORDER HEADER
    // =====================================================

    output += buildHeaderBlock();
    output += '\n';

    output += line;
    output += '\n';

    // =====================================================
    // ITEM HEADER
    //
    // 48 chars:
    //
    // ITEM                      QTY     RATE       AMT
    //
    // ITEM = 24
    // QTY  = 5
    // RATE = 9
    // AMT  = 10
    // TOTAL = 48
    // =====================================================

    output +=
      padRight('ITEM', 24) +
      padLeft('QTY', 5) +
      padLeft('RATE', 9) +
      padLeft('AMT', 10);

    output += '\n';
    output += line;
    output += '\n';

    // =====================================================
    // ITEMS
    // =====================================================

    for (const item of items) {
      const name =
        String(
          item?.name ?? 'ITEM'
        )
          .toUpperCase();

      const qty =
        Number(
          item?.quantity ?? 0
        );

      const rate =
        Number(
          item?.rate ?? 0
        );

      const amount =
        Number(
          item?.amount ??
          rate * qty
        );

      output +=
        padRight(
          name,
          24
        ) +
        padLeft(
          qty,
          5
        ) +
        padLeft(
          rate.toFixed(2),
          9
        ) +
        padLeft(
          amount.toFixed(2),
          10
        );

      output += '\n';

      // ---------------------------------------------------
      // MODIFIERS
      // ---------------------------------------------------

      if (
        Array.isArray(
          item?.modifiers
        )
      ) {
        item.modifiers.forEach(
          (modifier) => {
            const modifierName =
              typeof modifier === 'string'
                ? modifier
                : modifier?.name;

            if (
              modifierName &&
              String(
                modifierName
              ).trim()
            ) {
              output +=
                `    + ${String(
                  modifierName
                )}\n`;
            }
          }
        );
      }

      // ---------------------------------------------------
      // NOTE
      // ---------------------------------------------------

      if (
        item?.note &&
        String(
          item.note
        ).trim()
      ) {
        output +=
          `    • ${String(
            item.note
          )}\n`;
      }
    }

    output += line;
    output += '\n';

    // =====================================================
    // CALCULATED TOTALS
    //
    // IMPORTANT:
    // These values are NOT recalculated here.
    //
    // React / calculateBillAndroid() already calculated them.
    // Formatter only prints them.
    // =====================================================

    const subtotal =
      Number(
        data?.subtotal ?? 0
      );

    const tax =
      Number(
        data?.tax ?? 0
      );

    const discount =
      Number(
        data?.discount ?? 0
      );

    const deliveryFee =
      Number(
        data?.deliveryFee ?? 0
      );

    const total =
      Number(
        data?.grandTotal ??
        data?.total ??
        0
      );

    // =====================================================
    // TOTALS BLOCK
    //
    // Same order as Android
    // =====================================================

    output += totalLine(
      'Item Total',
      subtotal
    );

    if (deliveryFee > 0) {
      output += totalLine(
        'Delivery',
        deliveryFee
      );
    }

    if (discount > 0) {
      output += totalLine(
        'Discount',
        discount
      );
    }

    if (tax > 0) {
      output += totalLine(
        'Tax',
        tax
      );
    }

    // =====================================================
    // GRAND TOTAL
    // =====================================================

    output += line;
    output += '\n';

    output += totalLine(
      'GRAND TOTAL',
      total
    );

    output += line;
    output += '\n';

    // =====================================================
    // PAYMENT
    // =====================================================

    if (data?.paymentMode) {
      output +=
        `Payment   : ${data.paymentMode}\n`;
    }

    // =====================================================
    // CUSTOMER
    // =====================================================

    if (
      data?.customerName &&
      data.customerName !== 'Customer' &&
      data.customerName !== 'Walk-in'
    ) {
      output +=
        `Customer  : ${data.customerName}\n`;
    }

    if (data?.customerPhone) {
      output +=
        `Phone     : ${data.customerPhone}\n`;
    }

    // =====================================================
    // FOOTER
    // =====================================================

    output += '\n';
    output += center('THANK YOU');
    output += '\n';
    output += '\n';
    output += '\n';

    return output;
  }
}

module.exports = {
  BillFormatter80,
};
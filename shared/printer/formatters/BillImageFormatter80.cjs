const sharp = require('sharp');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class BillImageFormatter80 {

    // ============================================================
    // RECEIPT CONFIGURATION
    // ============================================================

    //   static WIDTH = 576;
    //   static LEFT = 20;
    //   static RIGHT = 556;
    static WIDTH = 576;
    static LEFT = 8;
    static RIGHT = 540;



    static CONTENT_WIDTH =
        BillImageFormatter80.RIGHT -
        BillImageFormatter80.LEFT;

    // ============================================================
    // HELPERS
    // ============================================================

    static escapeXml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    static money(value) {
        return Number(value || 0).toFixed(2);
    }

    static wrapText(text, maxChars) {
        const value = String(text ?? '').trim();

        if (!value) {
            return [];
        }

        const words = value.split(/\s+/);
        const lines = [];

        let current = '';

        for (const word of words) {

            if (!current) {
                current = word;
                continue;
            }

            const candidate =
                `${current} ${word}`;

            if (candidate.length <= maxChars) {
                current = candidate;
            } else {
                lines.push(current);
                current = word;
            }
        }

        if (current) {
            lines.push(current);
        }

        return lines;
    }

    static text(
        x,
        y,
        value,
        {
            size = 22,
            weight = 400,
            anchor = 'start',
            family = 'Arial',
            letterSpacing = 0,
        } = {}
    ) {

        return `
      <text
        x="${x}"
        y="${y}"
        font-family="${family}"
        font-size="${size}px"
        font-weight="${weight}"
        text-anchor="${anchor}"
        letter-spacing="${letterSpacing}px"
        fill="#000000"
      >
        ${this.escapeXml(value)}
      </text>
    `;
    }

    static line(y, x1 = this.LEFT, x2 = this.RIGHT) {

        return `
      <line
        x1="${x1}"
        y1="${y}"
        x2="${x2}"
        y2="${y}"
        stroke="#000000"
        stroke-width="2"
      />
    `;
    }

    static rect(x, y, width, height) {

        return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        fill="white"
        stroke="#000000"
        stroke-width="2"
      />
    `;
    }

    // ============================================================
    // LOGO
    // ============================================================

    static async loadLogo(data) {

        /*
         * data.logoPath can be supplied from Electron.
         *
         * Example:
         * logoPath: path.join(app.getPath('userData'), 'logo.png')
         */

        if (!data?.logoPath) {
            return null;
        }

        try {

            if (!fs.existsSync(data.logoPath)) {
                return null;
            }

            const buffer = fs.readFileSync(
                data.logoPath
            );

            return buffer.toString('base64');

        } catch (error) {

            console.error(
                'BILL IMAGE LOGO ERROR:',
                error
            );

            return null;
        }
    }

    // ============================================================
    // OUTLET HEADER
    // ============================================================

    static drawOutletHeader(data, y) {

        let svg = '';

        const centerX =
            this.WIDTH / 2;

        // ----------------------------------------------------------
        // Outlet name
        // ----------------------------------------------------------

        if (data?.outletName) {

            svg += this.text(
                centerX,
                y,
                String(data.outletName).toUpperCase(),
                {
                    size: 32,
                    weight: 700,
                    anchor: 'middle',
                }
            );

            y += 42;
        }

        // ----------------------------------------------------------
        // Address
        // ----------------------------------------------------------

        const addressParts = [
            data?.addressLine1,
            data?.addressLine2,
            data?.addressLine3,
            data?.city,
        ].filter(Boolean);

        const address =
            addressParts.join(', ');

        if (address) {

            const lines =
                this.wrapText(address, 58);

            for (const line of lines) {

                svg += this.text(
                    centerX,
                    y,
                    line,
                    {
                        size: 20,
                        anchor: 'middle',
                    }
                );

                y += 28;
            }
        }

        // ----------------------------------------------------------
        // Phones
        // ----------------------------------------------------------

        const phones = [
            data?.phone,
            data?.phone2,
        ].filter(Boolean);

        if (phones.length) {

            const phoneText =
                phones
                    .map(phone => `☎ ${phone}`)
                    .join('   |   ');

            const lines =
                this.wrapText(phoneText, 55);

            for (const line of lines) {

                svg += this.text(
                    centerX,
                    y,
                    line,
                    {
                        size: 20,
                        anchor: 'middle',
                    }
                );

                y += 28;
            }
        }

        // ----------------------------------------------------------
        // GST
        // ----------------------------------------------------------

        if (data?.gstVatNumber) {

            svg += this.text(
                centerX,
                y,
                `GSTIN : ${data.gstVatNumber}`,
                {
                    size: 20,
                    anchor: 'middle',
                }
            );

            y += 30;
        }

        y += 10;

        svg += this.line(y);

        y += 45;

        // ----------------------------------------------------------
        // TAX INVOICE
        // ----------------------------------------------------------

        svg += this.text(
            centerX,
            y,
            'TAX INVOICE',
            {
                size: 26,
                weight: 700,
                anchor: 'middle',
            }
        );

        y += 38;

        // ----------------------------------------------------------
        // ORDER TYPE
        // ----------------------------------------------------------

        if (data?.orderType) {

            const type =
                String(data.orderType)
                    .replace(/_/g, ' ');

            svg += this.text(
                centerX,
                y,
                type,
                {
                    size: 30,
                    weight: 700,
                    anchor: 'middle',
                }
            );

            y += 38;
        }

        svg += this.line(y);

        y += 35;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // ORDER INFORMATION
    // ============================================================

    static drawOrderInfo(data, y) {

        let svg = '';

        // Invoice / Date

        svg += this.text(
            this.LEFT,
            y,
            `Invoice No : ${data?.orderNo || data?.billNo || '-'}`,
            {
                size: 21,
            }
        );

        svg += this.text(
            this.RIGHT,
            y,
            data?.dateTime ||
            (
                data?.createdAt
                    ? new Date(
                        data.createdAt
                    ).toLocaleString()
                    : ''
            ),
            {
                size: 21,
                anchor: 'end',
            }
        );

        y += 42;

        // Table / Steward

        if (data?.orderType === 'DINE_IN') {

            svg += this.text(
                this.LEFT,
                y,
                `Table : ${data?.tableName || data?.tableNo || '-'}`,
                {
                    size: 21,
                }
            );

            if (data?.stewardName) {

                svg += this.text(
                    this.RIGHT - 20,
                    y,
                    `Steward : ${data.stewardName}`,
                    {
                        size: 21,
                        anchor: 'end',
                    }
                );
            }

            y += 42;
        }

        // KOT

        if (data?.kotNumberText) {

            svg += this.text(
                this.LEFT,
                y,
                `KOT(s) : ${data.kotNumberText}`,
                {
                    size: 21,
                }
            );

            y += 32;
        }

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // ITEM HEADER
    // ============================================================

    static drawItemsHeader(y) {

        let svg = '';

        const top = y;
        const height = 58;
        const bottom = top + height;

        // ----------------------------------------------------------
        // Column positions
        //
        // ITEM | RATE | QTY | AMOUNT
        // ----------------------------------------------------------

        // const line1 = 340;
        // const line2 = 410;
        // const line3 = 475;

        // const line1 = 320; // Item
        // const line2 = 395; // Rate
        // const line3 = 465; // Qty

        //THIS IS TITLE BOX SIZE
        const line1 = 310; // Item
        const line2 = 380; // Rate
        const line3 = 455; // Qty

        svg += this.rect(
            this.LEFT,
            top,
            this.CONTENT_WIDTH,
            height
        );

        svg += `
      <line
        x1="${line1}"
        y1="${top}"
        x2="${line1}"
        y2="${bottom}"
        stroke="#000000"
        stroke-width="2"
      />

      <line
        x1="${line2}"
        y1="${top}"
        x2="${line2}"
        y2="${bottom}"
        stroke="#000000"
        stroke-width="2"
      />

      <line
        x1="${line3}"
        y1="${top}"
        x2="${line3}"
        y2="${bottom}"
        stroke="#000000"
        stroke-width="2"
      />
    `;

        const textY =
            top +
            height / 2 +
            8;

        svg += this.text(
            (this.LEFT + line1) / 2,
            textY,
            'Item Name',
            {
                size: 20,
                weight: 700,
                anchor: 'middle',
            }
        );

        svg += this.text(
            (line1 + line2) / 2,
            textY,
            'Rate',
            {
                size: 20,
                weight: 700,
                anchor: 'middle',
            }
        );

        svg += this.text(
            (line2 + line3) / 2,
            textY,
            'Qty',
            {
                size: 20,
                weight: 700,
                anchor: 'middle',
            }
        );

        svg += this.text(
            (line3 + this.RIGHT) / 2,
            textY,
            'Amt',
            {
                size: 20,
                weight: 700,
                anchor: 'middle',
            }
        );

        return {
            svg,
            y: bottom + 35,
        };
    }

    // ============================================================
    // ITEMS
    // ============================================================

    static drawItems(data, y) {

        let svg = '';

        const items = Array.isArray(data?.items)
            ? data.items
            : [];
        //THIS IS TITLE BOX SIZE
        // const line1 = 310; // Item
        // const line2 = 380; // Rate
        // const line3 = 455; // Qty

        //THIS IS ACTUAL DATA
        const itemX = this.LEFT;
        const rateX = 380;
        const qtyX = 445;
        const amountX = this.RIGHT;

        for (const item of items) {

            const name =
                String(item?.name || 'ITEM');

            const quantity =
                Number(item?.quantity || 0);

            const rate =
                Number(item?.rate || 0);

            const amount =
                Number(
                    item?.amount ??
                    rate * quantity
                );

            // --------------------------------------------------------
            // Main item
            // --------------------------------------------------------

            const nameLines =
                this.wrapText(name, 27);

            for (
                let index = 0;
                index < nameLines.length;
                index++
            ) {

                svg += this.text(
                    itemX,
                    y,
                    nameLines[index],
                    {
                        size: 21,
                        weight:
                            index === 0 ? 600 : 400,
                    }
                );

                if (index < nameLines.length - 1) {
                    y += 27;
                }
            }

            // Rate / Qty / Amount align with first item line

            const firstLineY =
                y -
                ((nameLines.length - 1) * 27);

            svg += this.text(
                rateX,
                firstLineY,
                this.money(rate),
                {
                    size: 21,
                    anchor: 'end',
                }
            );

            svg += this.text(
                qtyX,
                firstLineY,
                String(quantity),
                {
                    size: 21,
                    anchor: 'end',
                }
            );

            svg += this.text(
                amountX,
                firstLineY,
                this.money(amount),
                {
                    size: 21,
                    anchor: 'end',
                }
            );

            y += 32;

            // --------------------------------------------------------
            // Modifiers
            // --------------------------------------------------------

            if (item?.modifiers) {

                const modifiers =
                    Array.isArray(item.modifiers)
                        ? item.modifiers
                        : [item.modifiers];

                for (const modifier of modifiers) {

                    svg += this.text(
                        itemX + 10,
                        y,
                        `+ ${modifier}`,
                        {
                            size: 18,
                        }
                    );

                    y += 25;
                }
            }

            // --------------------------------------------------------
            // Note
            // --------------------------------------------------------

            if (item?.note) {

                svg += this.text(
                    itemX + 10,
                    y,
                    `• ${item.note}`,
                    {
                        size: 18,
                    }
                );

                y += 25;
            }

            // Space between items

            y += 12;
        }

        y -= 5;

        svg += this.line(y);

        y += 35;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // TOTAL / TAX SUMMARY
    // ============================================================

    static drawAmountSummary(data, y) {

        let svg = '';

        const labelX =
            this.LEFT;

        const valueX =
            this.RIGHT;

        const drawValue = (
            label,
            value
        ) => {

            svg += this.text(
                labelX,
                y,
                label,
                {
                    size: 22,
                }
            );

            svg += this.text(
                valueX,
                y,
                this.money(value),
                {
                    size: 22,
                    anchor: 'end',
                }
            );

            y += 34;
        };

        // ----------------------------------------------------------
        // ITEM TOTAL
        // ----------------------------------------------------------

        drawValue(
            'Item Total',
            data?.subtotal ?? 0
        );

        // ----------------------------------------------------------
        // DISCOUNT
        // ----------------------------------------------------------

        if (
            Number(data?.discount || 0) > 0
        ) {

            drawValue(
                'Discount',
                -Number(data.discount)
            );
        }

        // ----------------------------------------------------------
        // TAXABLE AMOUNT
        // ----------------------------------------------------------

        const itemTotal =
            Number(data?.subtotal || 0);

        const discount =
            Number(data?.discount || 0);

        const itemTax =
            Number(data?.tax || 0);

        const taxableAmount =
            data?.taxMode === 'FORCE_INCLUSIVE'
                ? itemTotal -
                discount -
                itemTax
                : itemTotal -
                discount;

        drawValue(
            'Taxable Amount',
            taxableAmount
        );

        // ----------------------------------------------------------
        // GST
        // ----------------------------------------------------------

        if (itemTax > 0) {

            if (
                data?.countryCode === 'IN'
            ) {

                const cgst =
                    itemTax / 2;

                const sgst =
                    itemTax / 2;

                const cgstPercent =
                    Number(
                        data?.cgstPercent ?? 2.5
                    );

                const sgstPercent =
                    Number(
                        data?.sgstPercent ?? 2.5
                    );

                drawValue(
                    `Central GST ${cgstPercent.toFixed(1)}%`,
                    cgst
                );

                drawValue(
                    `State GST ${sgstPercent.toFixed(1)}%`,
                    sgst
                );

            } else {

                drawValue(
                    data?.taxType || 'Tax',
                    itemTax
                );
            }
        }

        // ----------------------------------------------------------
        // DELIVERY
        // ----------------------------------------------------------

        const deliveryFee =
            Number(data?.deliveryFee || 0);

        if (deliveryFee > 0) {

            drawValue(
                'Delivery Charge',
                deliveryFee
            );
        }

        // ----------------------------------------------------------
        // DELIVERY TAX
        // ----------------------------------------------------------

        const deliveryTax =
            Number(data?.deliveryTax || 0);

        if (deliveryTax > 0) {

            drawValue(
                'Delivery Tax',
                deliveryTax
            );
        }

        // ----------------------------------------------------------
        // ROUND OFF
        // ----------------------------------------------------------

        const grandTotal =
            Number(data?.grandTotal || 0);

        const roundedTotal =
            Math.round(grandTotal);

        const roundOff =
            roundedTotal -
            grandTotal;

        if (
            Math.abs(roundOff) >= 0.01
        ) {

            drawValue(
                'Round Off',
                roundOff
            );
        }

        y += 5;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // DISCOUNT BIG DISPLAY
    // ============================================================

    static drawDiscountSummary(data, y) {

        let svg = '';

        const discount =
            Number(data?.discount || 0);

        if (discount <= 0) {
            return {
                svg,
                y,
            };
        }

        y += 25;

        svg += this.text(
            this.LEFT,
            y,
            `Discount ₹${discount.toFixed(0)}`,
            {
                size: 32,
                weight: 700,
            }
        );

        y += 50;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // GRAND TOTAL BOX
    // ============================================================

    static drawGrandTotalBox(data, y) {

        let svg = '';

        const top =
            y + 15;

        const height =
            78;

        const bottom =
            top + height;

        const midX =
            365;

        svg += this.rect(
            this.LEFT,
            top,
            this.CONTENT_WIDTH,
            height
        );

        svg += `
      <line
        x1="${midX}"
        y1="${top}"
        x2="${midX}"
        y2="${bottom}"
        stroke="#000000"
        stroke-width="2"
      />
    `;

        svg += this.text(
            (this.LEFT + midX) / 2,
            top + 48,
            'PLEASE PAY',
            {
                size: 26,
                weight: 700,
                anchor: 'middle',
            }
        );

        svg += this.text(
            this.RIGHT - 20,
            top + 48,
            this.money(data?.grandTotal),
            {
                size: 32,
                weight: 700,
                anchor: 'end',
            }
        );

        y = bottom + 38;

        // ----------------------------------------------------------
        // Amount in words
        // ----------------------------------------------------------

        if (data?.amountInWords) {

            const lines =
                this.wrapText(
                    data.amountInWords,
                    50
                );

            for (const line of lines) {

                svg += this.text(
                    this.WIDTH / 2,
                    y,
                    line,
                    {
                        size: 20,
                        anchor: 'middle',
                    }
                );

                y += 27;
            }
        }

        y += 20;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // QR
    // ============================================================

    static async drawQrCode(data, y) {

        let svg = '';

        if (!data?.qrEnabled) {
            return {
                svg,
                y,
            };
        }

        if (!data?.upiId) {
            return {
                svg,
                y,
            };
        }

        try {

            const qrData =
                `upi://pay?pa=${encodeURIComponent(
                    data.upiId
                )}&pn=${encodeURIComponent(
                    data.outletName || ''
                )}&am=${encodeURIComponent(
                    this.money(data.grandTotal)
                )}&cu=INR`;

            const qrDataUrl =
                await QRCode.toDataURL(
                    qrData,
                    {
                        width: 280,
                        margin: 1,
                        errorCorrectionLevel: 'M',
                    }
                );

            const base64 =
                qrDataUrl.split(',')[1];

            const qrSize = 280;

            const x =
                (this.WIDTH - qrSize) / 2;

            y -= 5;

            svg += `
        <image
          href="data:image/png;base64,${base64}"
          x="${x}"
          y="${y}"
          width="${qrSize}"
          height="${qrSize}"
        />
      `;

            y += qrSize + 32;

            svg += this.text(
                this.WIDTH / 2,
                y,
                data.qrTitle ||
                'SCAN & PAY',
                {
                    size: 26,
                    weight: 700,
                    anchor: 'middle',
                }
            );

            y += 35;

        } catch (error) {

            console.error(
                'BILL QR ERROR:',
                error
            );
        }

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // FOOTER
    // ============================================================

    static drawFooter(data, y) {

        let svg = '';

        y += 10;

        svg += this.line(y);

        y += 40;

        if (data?.footerNote) {

            const lines =
                this.wrapText(
                    data.footerNote,
                    55
                );

            for (const line of lines) {

                svg += this.text(
                    this.WIDTH / 2,
                    y,
                    line,
                    {
                        size: 19,
                        anchor: 'middle',
                    }
                );

                y += 26;
            }
        }

        svg += this.text(
            this.WIDTH / 2,
            y,
            'Thank You!',
            {
                size: 24,
                weight: 700,
                anchor: 'middle',
            }
        );

        y += 45;

        return {
            svg,
            y,
        };
    }

    // ============================================================
    // MAIN FORMATTER
    // ============================================================

    async format(data) {

        let y = 30;

        let svgContent = '';

        // ----------------------------------------------------------
        // LOGO
        // ----------------------------------------------------------

        // const logo =
        //   await this.loadLogo(data);

        // if (logo) {

        //   const logoWidth = 300;
        //   const logoHeight = 130;

        //   svgContent += `
        //     <image
        //       href="data:image/png;base64,${logo}"
        //       x="${(this.WIDTH - logoWidth) / 2}"
        //       y="${y}"
        //       width="${logoWidth}"
        //       height="${logoHeight}"
        //       preserveAspectRatio="xMidYMid meet"
        //     />
        //   `;

        //   y += logoHeight + 25;
        // }

        // ----------------------------------------------------------
        // OUTLET HEADER
        // ----------------------------------------------------------

        let result =
            BillImageFormatter80.drawOutletHeader(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // ORDER INFO
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawOrderInfo(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // ITEMS HEADER
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawItemsHeader(
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // ITEMS
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawItems(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // TOTALS
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawAmountSummary(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // DISCOUNT
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawDiscountSummary(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // GRAND TOTAL
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawGrandTotalBox(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // QR
        // ----------------------------------------------------------

        result =
            await BillImageFormatter80.drawQrCode(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // FOOTER
        // ----------------------------------------------------------

        result =
            BillImageFormatter80.drawFooter(
                data,
                y
            );

        svgContent += result.svg;
        y = result.y;

        // ----------------------------------------------------------
        // SVG
        // ----------------------------------------------------------

        const height =
            Math.max(
                1000,
                y + 30
            );

        const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="${this.WIDTH}"
        height="${height}"
        viewBox="0 0 ${this.WIDTH} ${height}"
      >

        <rect
          x="0"
          y="0"
          width="${this.WIDTH}"
          height="${height}"
          fill="white"
        />

        ${svgContent}

      </svg>
    `;

        // ----------------------------------------------------------
        // SVG → PNG
        // ----------------------------------------------------------
        return await sharp(
            Buffer.from(svg)
        )
            .flatten({
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                },
            })
            .png()
            .toBuffer();




    }
}

module.exports = {
    BillImageFormatter80,
};
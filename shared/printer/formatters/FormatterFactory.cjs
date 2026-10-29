const {
  PrinterPaperSize,
  PrinterRole,
} = require('../types.ts');

const {
  KitchenFormatter58,
} = require('./KitchenFormatter58.cjs');

const {
  KitchenFormatter80,
} = require('./KitchenFormatter80.cjs');

const {
  BillFormatter80,
} = require('./BillFormatter80.cjs');

const {
  ReportFormatter,
} = require('./ReportFormatter.cjs');

const {
  BillImageFormatter80,
} = require('./BillImageFormatter80.cjs');


class FormatterFactory {

  // =====================================================
  // KITCHEN TEXT
  // =====================================================

  static createKitchenFormatter(paperSize) {

    switch (paperSize) {

      case PrinterPaperSize.MM58:
        return new KitchenFormatter58();

      case PrinterPaperSize.MM80:
      default:
        return new KitchenFormatter80();
    }
  }

  // =====================================================
  // BILL TEXT
  // =====================================================

  static createBillFormatter(paperSize) {

    switch (paperSize) {

      case PrinterPaperSize.MM58:
        return new BillFormatter80();

      case PrinterPaperSize.MM80:
      default:
        return new BillFormatter80();
    }
  }

  // =====================================================
  // BILL IMAGE
  // =====================================================

  static createBillImageFormatter(paperSize) {

    switch (paperSize) {

      case PrinterPaperSize.MM58:
        // Create BillImageFormatter58 later
        return new BillImageFormatter80();

      case PrinterPaperSize.MM80:
      default:
        return new BillImageFormatter80();
    }
  }

  // =====================================================
  // MAIN TEXT FACTORY
  // =====================================================

  // static create(role, paperSize) {

  //   switch (role) {

  //     case PrinterRole.KITCHEN:
  //       return this.createKitchenFormatter(
  //         paperSize
  //       );

  //     case PrinterRole.BILL:
  //       return this.createBillFormatter(
  //         paperSize
  //       );

  //     case PrinterRole.BAR:
  //       throw new Error(
  //         'Bar formatter not implemented yet'
  //       );

  //     default:
  //       throw new Error(
  //         `Unsupported printer role: ${role}`
  //       );
  //   }
  // }


static create(role, paperSize) {
  switch (role) {
    case PrinterRole.KITCHEN:
      return this.createKitchenFormatter(paperSize);

    case PrinterRole.BILL:
      return this.createBillFormatter(paperSize);

    case 'REPORT':
      return new ReportFormatter(paperSize);

    case PrinterRole.BAR:
      throw new Error(
        'Bar formatter not implemented yet'
      );

    default:
      throw new Error(
        `Unsupported printer role: ${role}`
      );
  }
}


}

module.exports = {
  FormatterFactory,
};
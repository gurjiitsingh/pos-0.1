import { PrinterPaperSize } from '../types';

export interface IReceiptFormatter<T = any> {
  format(
    data: T,
    paperSize: keyof typeof PrinterPaperSize
  ): string;
}



// import { PrinterPaperSize } from '../types';

// export interface IReceiptFormatter<T = any> {
//   format(
//     data: T,
//     paperSize: (typeof PrinterPaperSize)[keyof typeof PrinterPaperSize]
//   ): string;
// }
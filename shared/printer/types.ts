export const PrinterRole = {
  BILL: 'BILL',
  KITCHEN: 'KITCHEN',
  BAR: 'BAR',
} as const;

export const PrinterPaperSize = {
  MM80: '80mm',
  MM58: '58mm',
} as const;

export const ReceiptRenderMode = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;

export const PrinterConnectionType = {
  LAN: 'LAN',
  BLUETOOTH: 'BLUETOOTH',
  USB: 'USB',
} as const;

export type PrinterRole =
  (typeof PrinterRole)[keyof typeof PrinterRole];

export type PrinterPaperSize =
  (typeof PrinterPaperSize)[keyof typeof PrinterPaperSize];

export type ReceiptRenderMode =
  (typeof ReceiptRenderMode)[keyof typeof ReceiptRenderMode];

export type PrinterConnectionType =
  (typeof PrinterConnectionType)[keyof typeof PrinterConnectionType];


// const PrinterRole = {
//   BILL: 'BILL',
//   KITCHEN: 'KITCHEN',
//   BAR: 'BAR',
// };

// const PrinterPaperSize = {
//   MM80: '80mm',
//   MM58: '58mm',
// };

// const ReceiptRenderMode = {
//   TEXT: 'TEXT',
//   IMAGE: 'IMAGE',
// };

// const PrinterConnectionType = {
//   LAN: 'LAN',
//   BLUETOOTH: 'BLUETOOTH',
//   USB: 'USB',
// };

// module.exports = {
//   PrinterRole,
//   PrinterPaperSize,
//   ReceiptRenderMode,
//   PrinterConnectionType,
// };
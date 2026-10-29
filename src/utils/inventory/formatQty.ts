const decimalUnits = [
  "kg",
  "ltr",
  "litre",
  "liter",
];

const smallDecimalUnits = [
  "gm",
  "ml",
];

export function formatQuantity(
  value?: number,
  unit?: string
) {
  const num = Number(value || 0);

  // whole-number units
  if (
    [
      "pcs",
      "piece",
      "bottle",
      "dozen",
      "box",
      "pack",
      "tray",
    ].includes((unit || "").toLowerCase())
  ) {
    // remove trailing .00
    return Number.isInteger(num)
      ? num.toString()
      : num.toFixed(2);
  }

  // high precision units
  if (
    decimalUnits.includes(
      (unit || "").toLowerCase()
    )
  ) {
    return num.toFixed(3);
  }

  // medium precision units
  if (
    smallDecimalUnits.includes(
      (unit || "").toLowerCase()
    )
  ) {
    return num.toFixed(2);
  }

  return num.toFixed(2);
}
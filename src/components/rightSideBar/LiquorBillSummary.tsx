'use client';

type LiquorSummaryProps = {
  calculationLiquorVat: {
    itemSubtotal: number;
    itemTax: number;
    discount: number;
    grandTotal: number;
  };

  discount: number;
  discountPercent: number;

  setBillDraft: (value: any) => void;
  billDraft: {
    liquorDiscount: number;
    liquorDiscountPercent: number;
  };

  background: {
    border: string;
    text: string;
  };
};

export default function LiquorSummary({
  calculationLiquorVat,
  discount,
  discountPercent,
  setBillDraft,
  billDraft,
  background,
}: LiquorSummaryProps) {
  return (
    <div className="space-y-1 px-3 py-2 text-[12px]">

      {/* SUBTOTAL */}
      <div className="flex items-center justify-between py-0.5">
        <span className="opacity-55">
          Liquor Subtotal
        </span>

        <span className="font-medium opacity-75">
          ₹{calculationLiquorVat.itemSubtotal.toFixed(2)}
        </span>
      </div>

      {/* VAT */}
      <div className="flex items-center justify-between py-0.5">
        <span className="opacity-55">
          Liquor VAT
        </span>

        <span className="font-medium opacity-70">
          ₹{calculationLiquorVat.itemTax.toFixed(2)}
        </span>
      </div>

      {/* LIQUOR DISCOUNT */}
      <div className="flex items-center justify-between gap-2 py-1">

        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2">

          <span className="shrink-0 opacity-55">
            Liquor Discount
          </span>

          {/* FLAT */}
          <div
            className={`flex h-7 w-[68px] items-center rounded border ${background.border} bg-black/[0.025]`}
          >
            <span className="pl-2 text-[10px] opacity-35">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={discount === 0 ? '' : discount}
              onChange={(e) => {
                const value =
                  e.target.value === ''
                    ? 0
                    : Math.max(0, Number(e.target.value) || 0);

                setBillDraft({
                  ...billDraft,
                  liquorDiscount: value,
                  liquorDiscountPercent:
                    value > 0
                      ? 0
                      : billDraft.liquorDiscountPercent,
                });
              }}
              placeholder="0"
              className={`h-full w-full bg-transparent px-1 text-right text-[11px] ${background.text} outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            />
          </div>

          {/* OR */}
          <span className="text-[9px] opacity-25">
            OR
          </span>

          {/* PERCENT */}
          <div
            className={`flex h-7 w-[62px] items-center rounded border ${background.border} bg-black/[0.025]`}
          >
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={discountPercent === 0 ? '' : discountPercent}
              onChange={(e) => {
                const value =
                  e.target.value === ''
                    ? 0
                    : Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      );

                setBillDraft({
                  ...billDraft,
                  liquorDiscountPercent: value,
                  liquorDiscount:
                    value > 0
                      ? 0
                      : billDraft.liquorDiscount,
                });
              }}
              placeholder="0"
              className={`h-full w-full bg-transparent px-1 text-right text-[11px] ${background.text} outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            />

            <span className="pr-2 text-[10px] opacity-40">
              %
            </span>
          </div>
        </div>

        {/* CALCULATED DISCOUNT */}
        <span className="shrink-0 font-medium opacity-70">
          − ₹{calculationLiquorVat.discount.toFixed(2)}
        </span>
      </div>

      {/* GRAND TOTAL */}
      <div className="mt-1 flex items-center justify-between border-t border-current/10 pt-2">
        <span className="text-[13px] font-semibold opacity-85">
          Liquor Grand Total
        </span>

        <span className="text-[15px] font-bold opacity-95">
          ₹{calculationLiquorVat.grandTotal.toFixed(2)}
        </span>
      </div>

    </div>
  );
}
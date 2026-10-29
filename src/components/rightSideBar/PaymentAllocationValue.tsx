'use client';

import { useEffect, useState } from 'react';

export type PaymentAllocationValue = {
  cash: number;
  card: number;
  upi: number;
  credit: number;
};

type PaymentAllocationProps = {
  totalAmount: number;

  value: PaymentAllocationValue;

  onChange?: (
    payment: PaymentAllocationValue
  ) => void;

  onPay?: (
    payment: PaymentAllocationValue
  ) => void;

  onCancel?: () => void;
};

export default function PaymentAllocation({
  totalAmount,
  value,
  onChange,
  onPay,
  onCancel,
}: PaymentAllocationProps) {

  const [cash, setCash] = useState(
    Number(value?.cash || 0)
  );

  const [card, setCard] = useState(
    Number(value?.card || 0)
  );

  const [upi, setUpi] = useState(
    Number(value?.upi || 0)
  );

  const [credit, setCredit] = useState(
    Number(value?.credit || 0)
  );

  // =====================================================
  // SYNC FROM PARENT
  // =====================================================

  useEffect(() => {
    setCash(
      Number(value?.cash || 0)
    );

    setCard(
      Number(value?.card || 0)
    );

    setUpi(
      Number(value?.upi || 0)
    );

    setCredit(
      Number(value?.credit || 0)
    );
  }, [value]);

  // =====================================================
  // TOTAL ALLOCATED
  // =====================================================

  const totalAllocated =
    cash +
    card +
    upi +
    credit;

  // =====================================================
  // REMAINING
  // =====================================================

  const remaining =
    Math.max(
      0,
      totalAmount - totalAllocated
    );

  // =====================================================
  // OVER PAYMENT
  // =====================================================

  const overAmount =
    Math.max(
      0,
      totalAllocated - totalAmount
    );

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const isComplete =
    Math.abs(
      totalAllocated - totalAmount
    ) < 0.01;

  // =====================================================
  // UPDATE PAYMENT
  // =====================================================

  const updatePayment = (
    field:
      | 'cash'
      | 'card'
      | 'upi'
      | 'credit',
    valueAmount: number
  ) => {

    const amount =
      Math.max(
        0,
        Number(valueAmount) || 0
      );

    const next: PaymentAllocationValue = {
      cash,
      card,
      upi,
      credit,
    };

    next[field] = amount;

    setCash(next.cash);
    setCard(next.card);
    setUpi(next.upi);
    setCredit(next.credit);

    onChange?.(next);
  };

  // =====================================================
  // FILL REMAINING
  // =====================================================

  const fillRemaining = (
    field:
      | 'cash'
      | 'card'
      | 'upi'
      | 'credit'
  ) => {

    const currentValue =
      field === 'cash'
        ? cash
        : field === 'card'
          ? card
          : field === 'upi'
            ? upi
            : credit;

    const otherTotal =
      totalAllocated -
      currentValue;

    const amount =
      Math.max(
        0,
        totalAmount - otherTotal
      );

    updatePayment(
      field,
      amount
    );
  };

  // =====================================================
  // PAYMENT VALUE
  // =====================================================

  const paymentValue: PaymentAllocationValue = {
    cash,
    card,
    upi,
    credit,
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="
        w-full
        rounded-lg
        border
        border-zinc-700
        bg-zinc-900
        px-3
        py-3
        space-y-3
        shadow-2xl
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-zinc-700
          pb-2
        "
      >

        <div
          className="
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-zinc-300
          "
        >
          Payment
        </div>

        <div
          className="
            text-base
            font-bold
            text-white
          "
        >
          ₹{totalAmount.toFixed(2)}
        </div>

      </div>


      {/* =================================================
          CASH
      ================================================= */}

      <PaymentRow
        label="Cash"
        value={cash}
        onChange={(amount) =>
          updatePayment(
            'cash',
            amount
          )
        }
        onFill={() =>
          fillRemaining('cash')
        }
      />


      {/* =================================================
          CARD
      ================================================= */}

      <PaymentRow
        label="Card"
        value={card}
        onChange={(amount) =>
          updatePayment(
            'card',
            amount
          )
        }
        onFill={() =>
          fillRemaining('card')
        }
      />


      {/* =================================================
          UPI
      ================================================= */}

      <PaymentRow
        label="UPI"
        value={upi}
        onChange={(amount) =>
          updatePayment(
            'upi',
            amount
          )
        }
        onFill={() =>
          fillRemaining('upi')
        }
      />


      {/* =================================================
          CREDIT
      ================================================= */}

      <PaymentRow
        label="Credit"
        value={credit}
        onChange={(amount) =>
          updatePayment(
            'credit',
            amount
          )
        }
        onFill={() =>
          fillRemaining('credit')
        }
      />


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className="
          border-t
          border-zinc-700
          pt-2
          space-y-1.5
        "
      >

        <SummaryRow
          label="Allocated"
          value={totalAllocated}
        />

        <SummaryRow
          label="Remaining"
          value={remaining}
          valueClass={
            remaining > 0
              ? 'text-orange-400'
              : 'text-green-400'
          }
        />

        {overAmount > 0 && (
          <SummaryRow
            label="Over"
            value={overAmount}
            valueClass="text-red-400"
          />
        )}

      </div>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div
        className="
          flex
          items-center
          gap-2
          pt-1
        "
      >

        {/* CANCEL */}

        <button
          type="button"
          onClick={onCancel}
          className="
            h-9
            flex-1
            rounded-md
            border
            border-zinc-700
            bg-zinc-800
            text-xs
            font-semibold
            text-zinc-300
            hover:bg-zinc-700
            hover:text-white
            transition-colors
          "
        >
          CANCEL
        </button>


        {/* PAY */}

        <button
          type="button"
          disabled={!isComplete}
          onClick={() =>
            onPay?.(paymentValue)
          }
          className="
            h-9
            flex-[2]
            rounded-md
            bg-green-600
            text-xs
            font-bold
            text-white
            hover:bg-green-700
            transition-colors
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          PAY ₹{totalAmount.toFixed(2)}
        </button>

      </div>

    </div>
  );
}


// =====================================================
// PAYMENT ROW
// =====================================================

type PaymentRowProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onFill: () => void;
};

function PaymentRow({
  label,
  value,
  onChange,
  onFill,
}: PaymentRowProps) {

  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >

      {/* LABEL */}

      <div
        className="
          w-16
          shrink-0
          text-xs
          font-medium
          text-zinc-300
        "
      >
        {label}
      </div>


      {/* INPUT */}

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value === 0
            ? ''
            : value
        }
        onChange={(e) => {

          const raw =
            e.target.value;

          if (raw === '') {
            onChange(0);
            return;
          }

          onChange(
            Number(raw) || 0
          );
        }}
        className="
          h-9
          min-w-0
          flex-1
          rounded-md
          border
          border-zinc-700
          bg-zinc-800
          px-2
          text-right
          text-sm
          font-medium
          text-white
          outline-none
          focus:border-zinc-500

          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
        placeholder="0.00"
      />


      {/* FULL */}

      <button
        type="button"
        onClick={onFill}
        className="
          h-9
          w-12
          shrink-0
          rounded-md
          bg-zinc-700
          text-[10px]
          font-bold
          text-zinc-200
          hover:bg-zinc-600
          transition-colors
        "
      >
        FULL
      </button>

    </div>
  );
}


// =====================================================
// SUMMARY ROW
// =====================================================

function SummaryRow({
  label,
  value,
  valueClass = 'text-white',
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <span
        className="
          text-xs
          text-zinc-400
        "
      >
        {label}
      </span>

      <span
        className={`
          text-xs
          font-bold
          ${valueClass}
        `}
      >
        ₹{value.toFixed(2)}
      </span>

    </div>
  );
}
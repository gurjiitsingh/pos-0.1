'use client';

import { useEffect, useMemo, useState } from 'react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { useRouter } from 'next/navigation';
import { usePosAuth } from '@/store/PosAuthContext';

export default function DayClosingPage() {
  const router = useRouter();
  const {
    background,
    theme,
  } = usePosTheme();

  const {
  currentUser,
} = usePosAuth();

  const [businessDay, setBusinessDay] =
    useState<any>(null);

  const [summary, setSummary] =
    useState<any>(null);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [actualCash, setActualCash] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [closing, setClosing] =
    useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [pendingActualCash, setPendingActualCash] = useState(0);
  const [pendingDifference, setPendingDifference] = useState(0);





  const [showCashTransaction, setShowCashTransaction] =
    useState(false);

  const [cashTransactionType, setCashTransactionType] =
    useState<
      'TOPUP' |
      'OTHER_IN' |
      'WITHDRAWAL' |
      'EXPENSE' |
      'REFUND'
    >('TOPUP');

  const [cashTransactionAmount, setCashTransactionAmount] =
    useState('');

  const [cashTransactionReason, setCashTransactionReason] =
    useState('');

  const [cashTransactionNotes, setCashTransactionNotes] =
    useState('');

  const [savingCashTransaction, setSavingCashTransaction] =
    useState(false);
  const [cashHandedOver, setCashHandedOver] =
    useState('');

  // =====================================================
  // LOAD CURRENT BUSINESS DAY
  // =====================================================

  useEffect(() => {
    loadBusinessDay();
  }, []);


async function loadBusinessDay() {
  try {
    setLoading(true);
    setError('');
    setMessage('');

    const result =
      await window.posApi.getCurrentBusinessDay();

    console.log(
      'CURRENT BUSINESS DAY:',
      result
    );

    if (!result?.success) {
      setError(
        result?.error ||
        'Failed to load current business day'
      );

      return;
    }

    const day =
      result.data;

    setBusinessDay(day);

    setSelectedDate(
      day?.businessDate || ''
    );

    if (day?.businessDate) {
      await loadSummary(
        day.businessDate
      );
    }

  } catch (e: any) {

    setError(
      e?.message ||
      'Failed to load business day'
    );

  } finally {

    setLoading(false);

  }
}

  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  async function loadSummary(
    date: string
  ) {

    if (!date) {
      return;
    }

    try {

      const result =
        await window.posApi
          .getDayClosingSummary(
            date
          );

      console.log(
        'DAY SUMMARY:',
        result
      );

      if (!result?.success) {


      }

      setSummary(
        result.data || {}
      );

    } catch (e: any) {

      console.error(
        'LOAD SUMMARY FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to load summary'
      );
    }
  }


async function loadBusinessInfo(
  businessDate: string
) {
  if (!businessDate) {
    return;
  }

  try {

    const result =
      await window.posApi.getBusinessInfoByDate(
        businessDate
      ); 

    if (!result?.success) {
      setBusinessDay(null);

      setError(
        result?.error ||
        'Failed to load business information'
      );

      return;
    }

    setBusinessDay(
      result.data || null
    );

  } catch (e: any) {

    console.error(
      'LOAD BUSINESS INFO FAILED',
      e
    );

    setBusinessDay(null);

    setError(
      e?.message ||
      'Failed to load business information'
    );
  }
}


  // =====================================================
  // DATE CHANGE
  // =====================================================

async function handleDateChange(
  value: string
) {
  setSelectedDate(value);

  setError('');
  setMessage('');

  if (value) {
    await loadSummary(value);
    await loadBusinessInfo(value);
  }
}


  // =====================================================
  // VALUES
  // =====================================================

  const openingCash =
    Number(
      businessDay?.openingCash || 0
    );

  const cashSales =
    Number(
      summary?.cashSales || 0
    );

  const expectedCash =
    Number(
      summary?.expectedCash || 0
    );

  const actualCashValue =
    Number(actualCash || 0);

  const cashDifference =
    actualCash === ''
      ? 0
      : actualCashValue -
      expectedCash;

  const cashLeftInDrawer =
    actualCash === ''
      ? 0
      : actualCashValue -
      Number(cashHandedOver || 0);
  // =====================================================
  // TOTALS
  // =====================================================

  const totalOrders =
    Number(
      summary?.totalOrders || 0
    );

  const totalSales =
    Number(
      summary?.totalSales || 0
    );

  const totalDiscount =
    Number(
      summary?.totalDiscount || 0
    );

  const totalTax =
    Number(
      summary?.totalTax || 0
    );

  const complimentarySales =
    Number(
      summary?.complimentarySales || 0
    );

  const cardSales =
    Number(
      summary?.cardSales || 0
    );

  const upiSales =
    Number(
      summary?.upiSales || 0
    );

  const walletSales =
    Number(
      summary?.walletSales || 0
    );

  const creditSales =
    Number(
      summary?.creditSales || 0
    );


  // =====================================================
  // CLOSE DAY
  // =====================================================



  async function handleCloseDay() {

    if (closing) {
      return;
    }

    setError('');
    setMessage('');

    if (!businessDay) {
      setError(
        'Business day is not loaded.'
      );
      return;
    }

    if (!actualCash.trim()) {
      setError(
        'Please enter actual cash counted.'
      );
      return;
    }

    const countedCash =
      Number(actualCash);

    const handedOver =
      Number(cashHandedOver || 0);


    if (
      !Number.isFinite(countedCash) ||
      countedCash < 0
    ) {
      setError(
        'Please enter a valid actual cash amount.'
      );
      return;
    }


    if (
      !Number.isFinite(handedOver) ||
      handedOver < 0
    ) {
      setError(
        'Please enter a valid cash handed over amount.'
      );
      return;
    }


    if (
      handedOver > countedCash
    ) {
      setError(
        'Cash handed over cannot be greater than actual cash counted.'
      );
      return;
    }


    const difference =
      countedCash -
      expectedCash;


    const leftInDrawer =
      countedCash -
      handedOver;


    setPendingActualCash(
      countedCash
    );

    setPendingDifference(
      difference
    );

    setShowCloseConfirm(
      true
    );
  }
  async function confirmCloseDay() {

    setShowCloseConfirm(false);

    if (closing) {
      return;
    }

    try {

      setClosing(true);

      const result =
        await window.posApi.closeBusinessDay({

          actualCash:
            pendingActualCash,

          cashHandedOver:
            Number(
              cashHandedOver || 0
            ),

          notes,

           closedById:
          currentUser?.userId || '',

        closedByName:
          currentUser?.fullName || '',

        });

      console.log(
        'CLOSE DAY RESULT:',
        result
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
          'Failed to close business day'
        );
      }

      setMessage(
        'Business day closed successfully.'
      );

      setActualCash('');
      setNotes('');

      await loadBusinessDay();

    } catch (e: any) {

      console.error(
        'CLOSE DAY FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to close business day'
      );

    } finally {

      setClosing(false);

    }
  }
  // =====================================================
  // MONEY FORMAT
  // =====================================================

  function money(
    value: number
  ) {

    return `₹${Number(
      value || 0
    ).toFixed(2)}`;
  }


  // =====================================================
  // DATE FORMAT
  // =====================================================

  function formatDate(
    value: string
  ) {

    if (!value) {
      return '-';
    }

    try {

      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

    } catch {

      return value;

    }
  }


  // =====================================================
  // TIME FORMAT
  // =====================================================

  function formatDateTime(
    value: number
  ) {

    if (!value) {
      return '-';
    }

    return new Date(
      value
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }




  async function handleAddCashTransaction() {

    if (savingCashTransaction) return;

    setError('');
    setMessage('');

    const amount =
      Number(cashTransactionAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        'Please enter a valid amount.'
      );
      return;
    }

    if (
      !cashTransactionReason.trim()
    ) {
      setError(
        'Please enter a reason.'
      );
      return;
    }

    try {

      setSavingCashTransaction(true);

      const result =
        await window.posApi.addCashTransaction({
          type:
            cashTransactionType,

          amount:
            amount,

          reason:
            cashTransactionReason.trim(),

          notes:
            cashTransactionNotes.trim(),

          createdById:
            '',

          createdByName:
            '',
        });

      if (!result?.success) {

        setError(
          result?.error ||
          'Failed to add cash transaction.'
        );

        return;
      }

      setShowCashTransaction(false);

      setCashTransactionAmount('');
      setCashTransactionReason('');
      setCashTransactionNotes('');
      setCashHandedOver('')
      setCashTransactionType('TOPUP');

      setMessage(
        'Cash transaction added successfully.'
      );

      // Reload current business day / summary
const businessDayResult =
  await window.posApi.getCurrentBusinessDay();

if (businessDayResult?.success) {
  const day = businessDayResult.data;

  setBusinessDay(day);

  if (day?.businessDate) {
    setSelectedDate(day.businessDate);

    await loadSummary(
      day.businessDate
    );
  }
}

    } catch (e: any) {

      setError(
        e?.message ||
        'Failed to add cash transaction.'
      );

    } finally {

      setSavingCashTransaction(false);

    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div
        className={`
          min-h-screen
          ${background.className}
          ${background.text}
          flex
          items-center
          justify-center
          p-5
        `}
      >

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            px-6
            py-5
            text-sm
            opacity-60
          `}
        >
          Loading business day...
        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`
    h-[calc(100vh-60px)]
    min-h-0
    overflow-y-scroll
    app-scrollbar
    ${background.className}
    ${background.text}
    p-4
    pb-14
    md:p-5
  `}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          mb-4
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          ${background.border}
          p-4
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        `}
      >

        <div>

          <h1
            className="
              text-xl
              font-bold
              tracking-tight
            "
          >
            Business Day Closing
          </h1>


          <p
            className="
              mt-1
              text-xs
              opacity-50
            "
          >
            Review today's sales and close the
            business day.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <label
            className={`
    flex
    h-10
    items-center
    gap-2
    rounded-xl
    border
    ${background.border}
    px-3
  `}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                handleDateChange(e.target.value);
              }}
              className="h-10 rounded-xl border px-3"
            />
          </label>


          <button
            type="button"
            onClick={loadBusinessDay}
            disabled={loading}
            className="
              h-10
              rounded-xl
              px-4
              text-xs
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:opacity-50
            "
            style={{
              backgroundColor:
                theme.primary,
            }}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            onClick={() => router.push('/orders/byBusinessDate')}
            disabled={loading}
            className="
    h-10
    rounded-xl
    px-4
    text-xs
    font-semibold
    text-white
    transition
    hover:opacity-90
    disabled:opacity-50
  "
            style={{
              backgroundColor: theme.primary,
            }}
          >
            Order by Business Date
          </button>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >
          {message}
        </div>

      )}


      {error && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >
          {error}
        </div>

      )}









      <SectionCard
        title="Cash Transactions"
        subtitle="Manage cash movements for the current business day"
        background={background}

      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

          {/* <button
      type="button"
      onClick={() => {
        setCashTransactionType('TOPUP');
        setShowCashTransaction(true);
        setError('');
        setMessage('');
      }}
      className="rounded-xl border px-4 py-4 text-sm font-semibold transition hover:opacity-80"
      style={{
        borderColor: background.border,
      }}
    >
      + Cash Deposit
    </button> */}

          <button
            type="button"
            onClick={() => {
              setCashTransactionType('OTHER_IN');
              setShowCashTransaction(true);
              setError('');
              setMessage('');
            }}
            className="rounded-xl border px-4 py-4 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: background.border,
            }}
          >
            + Cash In
          </button>

          <button
            type="button"
            onClick={() => {
              setCashTransactionType('WITHDRAWAL');
              setShowCashTransaction(true);
              setError('');
              setMessage('');
            }}
            className="rounded-xl border px-4 py-4 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: background.border,
            }}
          >
            − Cash Withdrawal
          </button>

          <button
            type="button"
            onClick={() => {
              setCashTransactionType('EXPENSE');
              setShowCashTransaction(true);
              setError('');
              setMessage('');
            }}
            className="rounded-xl border px-4 py-4 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: background.border,
            }}
          >
            − Cash Expense
          </button>

          {/* <button
      type="button"
      onClick={() => {
        setCashTransactionType('REFUND');
        setShowCashTransaction(true);
        setError('');
        setMessage('');
      }}
      className="rounded-xl border px-4 py-4 text-sm font-semibold transition hover:opacity-80"
      style={{
        borderColor: background.border,
      }}
    >
      − Cash Refund
    </button> */}

        </div>
      </SectionCard>
      {/* =================================================
          TOP SUMMARY
      ================================================= */}

      <div
        className="
          my-4
          grid
          grid-cols-2
          gap-3
          md:grid-cols-4
        "
      >

        <SummaryCard
          title="Orders"
          value={String(totalOrders)}
          background={background}
        />

        <SummaryCard
          title="Total Sales"
          value={money(totalSales)}
          background={background}
        />

        <SummaryCard
          title="Discount"
          value={money(totalDiscount)}
          background={background}
        />

        <SummaryCard
          title="Tax"
          value={money(totalTax)}
          background={background}
        />

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div
        className="
          grid
          gap-4
          lg:grid-cols-2
        "
      >

        {/* =================================================
            BUSINESS INFORMATION
        ================================================= */}

        <SectionCard
          title="Business Information"
          background={background}
        >

          <InfoRow
            label="Business Date"
            value={formatDate(
              businessDay?.businessDate
            )}
          />

          <InfoRow
            label="Opened By"
            value={
              businessDay?.openedByName ||
              '-'
            }
          />

          <InfoRow
            label="Opened At"
            value={formatDateTime(
              businessDay?.openedAt
            )}
          />

          <InfoRow
            label="Opening Cash"
            // value={money(
            //   openingCash
            // )}
            value={money(
  businessDay?.openingCash || 0
)}
          />

        </SectionCard>


        {/* =================================================
            SALES SUMMARY
        ================================================= */}

        <SectionCard
          title="Sales Summary"
          background={background}
        >

          <MoneyRow
            label="Total Sales"
            value={totalSales}
          />

          <MoneyRow
            label="Discount"
            value={totalDiscount}
          />

          <MoneyRow
            label="Tax"
            value={totalTax}
          />

          <MoneyRow
            label="Complimentary"
            value={complimentarySales}
          />

          <div
            className="my-2 border-t"
            style={{
              borderColor:
                background.line,
            }}
          />

          <InfoRow
            label="Orders"
            value={String(
              totalOrders
            )}
          />

        </SectionCard>

      </div>


      {/* =================================================
          PAYMENT BREAKDOWN
      ================================================= */}

      <div className="mt-4">

        <SectionCard
          title="Payment Breakdown"
          background={background}
        >

          <div
            className="
              grid
              grid-cols-2
              gap-3
              md:grid-cols-5
            "
          >

            <PaymentCard
              title="Cash"
              value={cashSales}
            />

            <PaymentCard
              title="Card"
              value={cardSales}
            />

            <PaymentCard
              title="UPI"
              value={upiSales}
            />

            <PaymentCard
              title="Wallet"
              value={walletSales}
            />

            <PaymentCard
              title="Credit"
              value={creditSales}
            />

          </div>

        </SectionCard>

      </div>


      {/* =================================================
          CASH COUNT
      ================================================= */}

      <div className="mt-4">

        <SectionCard
          title="Cash Count"
          background={background}
        >

          <div
            className="
        grid
        gap-3
        md:grid-cols-3
      "
          >

            <MoneyBox
              title="Opening Cash"
              value={openingCash}
            />

            <MoneyBox
              title="Expected Cash"
              value={expectedCash}
            />

            <MoneyBox
              title="Cash Difference"
              value={cashDifference}
            />

          </div>


          <div
            className="
        mt-4
        grid
        gap-3
        md:grid-cols-3
      "
          >

            {/* =================================================
          ACTUAL CASH COUNTED
      ================================================= */}

            <div>

              <label
                className="
            mb-1.5
            block
            text-xs
            font-semibold
            opacity-60
          "
              >
                Actual Cash Counted
              </label>

              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={actualCash}
                onChange={(e) => {

                  const value =
                    e.target.value;

                  setActualCash(value);

                  // Default:
                  // Cash Handed Over = Actual Cash Counted
                  setCashHandedOver(value);

                }}
                placeholder="0.00"
                className={`
            h-11
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            text-sm
            font-semibold
            outline-none

            [appearance:textfield]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `}
              />

            </div>


            {/* =================================================
          CASH HANDED OVER
      ================================================= */}

            <div>

              <label
                className="
            mb-1.5
            block
            text-xs
            font-semibold
            opacity-60
          "
              >
                Cash Handed Over
              </label>

              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={
                  actualCash === ''
                    ? undefined
                    : actualCashValue
                }
                value={cashHandedOver}
                onChange={(e) =>
                  setCashHandedOver(
                    e.target.value
                  )
                }
                placeholder="0.00"
                className={`
            h-11
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            text-sm
            font-semibold
            outline-none

            [appearance:textfield]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `}
              />

              <div className="mt-1 text-xs opacity-50">
                Default is Actual Cash Counted
              </div>

            </div>


            {/* =================================================
          NOTES
      ================================================= */}

            <div>

              <label
                className="
            mb-1.5
            block
            text-xs
            font-semibold
            opacity-60
          "
              >
                Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Optional notes"
                className={`
            h-11
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            text-sm
            outline-none
          `}
              />

            </div>

          </div>





          {/* =================================================
        CLOSE BUTTON
    ================================================= */}

          <div
            className="
        mt-4
        flex
        justify-end
      "
          >

            <button
              type="button"
              onClick={handleCloseDay}
              disabled={
                closing ||
                !businessDay
              }
              className="
          flex
          h-11
          items-center
          gap-2
          rounded-xl
          px-5
          text-sm
          font-bold
          text-white
          transition
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
              style={{
                backgroundColor:
                  theme.primary,
              }}
            >

              🔒

              {closing
                ? 'Closing Day...'
                : 'Close Business Day'}

            </button>

          </div>

        </SectionCard>

      </div>

      {showCloseConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">

          <div
            className={`
        w-full
        max-w-md
        rounded-2xl
        border
        ${background.border}
        ${background.className}
        p-6
        shadow-2xl
      `}
          >

            <h2 className="text-lg font-bold">
              Close Business Day?
            </h2>

            <div className="mt-4 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="opacity-60">
                  Expected Cash
                </span>

                <span className="font-semibold">
                  {money(expectedCash)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="opacity-60">
                  Actual Cash
                </span>

                <span className="font-semibold">
                  {money(pendingActualCash)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="opacity-60">
                  Difference
                </span>

                <span className="font-semibold">
                  {money(pendingDifference)}
                </span>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowCloseConfirm(false)
                }
                className="
            rounded-xl
            border
            px-5
            py-2.5
            text-sm
            font-semibold
          "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmCloseDay}
                disabled={closing}
                className="
            rounded-xl
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            disabled:opacity-50
          "
                style={{
                  backgroundColor: theme.primary,
                }}
              >
                {closing
                  ? 'Closing...'
                  : 'Confirm'}
              </button>

            </div>

          </div>

        </div>
      )}


      {showCashTransaction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">

          <div
            className={`
        w-full
        max-w-md
        rounded-2xl
        border
        ${background.border}
        ${background.className}
        p-6
        shadow-2xl
      `}
          >

            <h2 className="text-lg font-bold">
              {cashTransactionType === 'TOPUP'
                ? 'Cash Deposit'
                : cashTransactionType === 'OTHER_IN'
                  ? 'Other Cash In'
                  : cashTransactionType === 'WITHDRAWAL'
                    ? 'Cash Withdrawal'
                    : cashTransactionType === 'EXPENSE'
                      ? 'Cash Expense'
                      : 'Cash Refund'}
            </h2>

            <p className="mt-1 text-sm opacity-70">
              Add cash transaction for business day{' '}
              {businessDay?.businessDate}
            </p>


            {/* AMOUNT */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={cashTransactionAmount}
                onChange={(e) =>
                  setCashTransactionAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
                autoFocus
                className={`
            h-11
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            outline-none
          `}
              />

            </div>


            {/* REASON */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-semibold">
                Reason
              </label>

              <input
                type="text"
                value={cashTransactionReason}
                onChange={(e) =>
                  setCashTransactionReason(
                    e.target.value
                  )
                }
                placeholder="Enter reason"
                className={`
            h-11
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            outline-none
          `}
              />

            </div>


            {/* NOTES */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-semibold">
                Notes
              </label>

              <textarea
                value={cashTransactionNotes}
                onChange={(e) =>
                  setCashTransactionNotes(
                    e.target.value
                  )
                }
                placeholder="Optional notes"
                rows={3}
                className={`
            w-full
            rounded-xl
            border
            ${background.border}
            bg-transparent
            px-3
            py-2
            outline-none
          `}
              />

            </div>


            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {

                  if (savingCashTransaction) return;

                  setShowCashTransaction(false);

                  setCashTransactionAmount('');
                  setCashTransactionReason('');
                  setCashTransactionNotes('');
                  setCashTransactionType('TOPUP');

                }}
                className="
            rounded-xl
            border
            border-gray-300
            px-5
            py-2.5
            text-sm
            font-semibold
          "
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={savingCashTransaction}
                onClick={handleAddCashTransaction}
                className="
            rounded-xl
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                style={{
                  backgroundColor:
                    theme.primary,
                }}
              >
                {savingCashTransaction
                  ? 'Saving...'
                  : 'Save Transaction'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  background,
}: any) {

  return (

    <div
      className={`
        rounded-xl
        border
        ${background.border}
        p-3
        shadow-sm
      `}
    >

      <p
        className="
          text-[11px]
          uppercase
          tracking-wider
          opacity-45
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        {value}
      </p>

    </div>
  );
}


// =====================================================
// SECTION CARD
// =====================================================

function SectionCard({
  title,
  children,
  background,
}: any) {

  return (

    <div
      className={`
        rounded-2xl
        border
        ${background.border}
        p-4
        shadow-sm
      `}
    >

      <h2
        className="
          mb-3
          text-sm
          font-bold
        "
      >
        {title}
      </h2>

      <div
        className="border-t pt-3"
        style={{
          borderColor:
            background.line,
        }}
      >
        {children}
      </div>

    </div>
  );
}


// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-1.5
      "
    >

      <span
        className="
          text-xs
          opacity-55
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-semibold
          text-right
        "
      >
        {value}
      </span>

    </div>
  );
}


// =====================================================
// MONEY ROW
// =====================================================

function MoneyRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        py-1.5
      "
    >

      <span
        className="
          text-xs
          opacity-55
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-semibold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </span>

    </div>
  );
}


// =====================================================
// PAYMENT CARD
// =====================================================

function PaymentCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-3
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-55
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-bold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>
  );
}


// =====================================================
// MONEY BOX
// =====================================================

function MoneyBox({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-3
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-55
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>
  );
}
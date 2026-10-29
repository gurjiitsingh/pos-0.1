'use client';

import {
  useEffect,
  useState,
} from 'react';


// =====================================================
// TYPES
// =====================================================

type RegisterResult = {
  success?: boolean;
  outletId?: string;
  terminal?: {
    terminalId?: string;
    terminalName?: string;
    ipAddress?: string;
    port?: number;
    deviceType?: string;
    isActive?: boolean;
    lastSeenAt?: number;
  };
};


// =====================================================
// PAGE
// =====================================================

export default function PosNetworkSettingsPage() {

  const [
    ipAddress,
    setIpAddress,
  ] = useState('Detecting...');


  const [
    port,
    setPort,
  ] = useState(2345);


  const [
    terminalId,
    setTerminalId,
  ] = useState('POS-01');


  const [
    terminalName,
    setTerminalName,
  ] = useState('Main POS');


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState('');


  const [
    error,
    setError,
  ] = useState(false);


  // ===================================================
  // LOAD IP
  // ===================================================

  async function loadIPAddress() {

    try {

      const result =
        await window.posApi.getPosIPAddress();


      if (
        result?.success &&
        result?.ipAddress
      ) {

        setIpAddress(
          result.ipAddress
        );

      } else {

        setIpAddress(
          'Not detected'
        );

      }

    } catch (error) {

      console.error(
        'Failed to detect POS IP',
        error
      );

      setIpAddress(
        'Not detected'
      );

    }

  }


  // ===================================================
  // REGISTER POS
  // ===================================================

  async function handleRegister() {

    if (loading) {
      return;
    }


    try {

      setLoading(true);

      setMessage('');

      setError(false);


      const result:
        RegisterResult =
        await window.posApi
          .registerPosTerminal();


      if (
        result?.success !== true
      ) {

        throw new Error(
          'POS registration failed.'
        );

      }


      const terminal =
        result.terminal;


      if (
        terminal?.ipAddress
      ) {

        setIpAddress(
          terminal.ipAddress
        );

      }


      if (
        terminal?.port
      ) {

        setPort(
          terminal.port
        );

      }


      if (
        terminal?.terminalId
      ) {

        setTerminalId(
          terminal.terminalId
        );

      }


      if (
        terminal?.terminalName
      ) {

        setTerminalName(
          terminal.terminalName
        );

      }


      setMessage(
        'POS network information updated successfully.'
      );

    } catch (error) {

      console.error(
        'POS registration failed',
        error
      );


      setError(true);


      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to register POS.'
      );

    } finally {

      setLoading(false);

    }

  }


  // ===================================================
  // INITIAL IP
  // ===================================================

  useEffect(() => {

    loadIPAddress();

  }, []);


  // ===================================================
  // UI
  // ===================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
      "
    >

      <div
        className="
          mx-auto
          max-w-3xl
        "
      >

        {/* =============================================
            HEADER
        ============================================= */}

        <div
          className="
            mb-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-slate-900
                text-white
              "
            >

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >

                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="13"
                  rx="2"
                />

                <path
                  d="M8 21h8"
                />

                <path
                  d="M12 17v4"
                />

              </svg>

            </div>


            <div>

              <h1
                className="
                  text-xl
                  font-bold
                  text-slate-900
                "
              >
                POS Network
              </h1>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Configure this desktop POS
                 {/* for Waiter connections. */}
              </p>

            </div>

          </div>

        </div>


        {/* =============================================
            NETWORK CARD
        ============================================= */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              border-b
              border-slate-100
              px-5
              py-4
            "
          >

            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Desktop POS 
              {/* Connection */}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {/* Waiter devices use this information
              to connect to this POS over the local
              restaurant network. */}
              For Printer and netwrok discovery
            </p>

          </div>


          <div className="p-5">

            {/* =========================================
                STATUS
            ========================================= */}

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
                rounded-xl
                bg-emerald-50
                px-4
                py-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-emerald-500
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-emerald-800
                  "
                >
                  POS Ready
                </span>

              </div>


              <span
                className="
                  text-xs
                  text-emerald-700
                "
              >
                Local Network
              </span>

            </div>


            {/* =========================================
                INFORMATION
            ========================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >

              <InfoItem
                label="Terminal"
                value={terminalId}
              />

              <InfoItem
                label="Name"
                value={terminalName}
              />

              <InfoItem
                label="IP Address"
                value={ipAddress}
                highlight
              />

              <InfoItem
                label="POS Port"
                value={String(port)}
              />

            </div>


            {/* =========================================
                CONNECTION ADDRESS
            ========================================= */}

            <div
              className="
                mt-4
                rounded-xl
                bg-slate-900
                px-4
                py-3
              "
            >

              {/* <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Waiter Connection
              </p> */}


              <p
                className="
                  mt-1
                  font-mono
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {ipAddress}:{port}
              </p>

            </div>


            {/* =========================================
                MESSAGE
            ========================================= */}

            {message && (

              <div
                className={`
                  mt-4
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-xs
                  ${
                    error
                      ? `
                        border-red-100
                        bg-red-50
                        text-red-700
                      `
                      : `
                        border-emerald-100
                        bg-emerald-50
                        text-emerald-700
                      `
                  }
                `}
              >

                {message}

              </div>

            )}


            {/* =========================================
                ACTIONS
            ========================================= */}

            <div
              className="
                mt-5
                flex
                flex-col
                gap-2
                sm:flex-row
              "
            >

              <button
                type="button"
                onClick={
                  loadIPAddress
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Refresh IP
              </button>


              <button
                type="button"
                onClick={
                  handleRegister
                }
                disabled={loading}
                className="
                  rounded-xl
                  bg-slate-900
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {loading
                  ? 'Updating...'
                  : 'Register POS'}

              </button>

            </div>

          </div>

        </section>


        {/* =============================================
            INFO
        ============================================= */}

        <div
          className="
            mt-4
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
          "
        >

          <p
            className="
              text-xs
              leading-5
              text-slate-500
            "
          >

            <span
              className="
                font-semibold
                text-slate-700
              "
            >
              Note:
            </span>{' '}
{/* 
            The IP address can change when the
            restaurant router assigns a new address.
            Use  */}
            "Register POS" after a network change

            {/* so Waiter devices receive the latest
            address. */}

          </p>

        </div>

      </div>

    </div>

  );

}


// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        px-4
        py-3
      "
    >

      <p
        className="
          text-[11px]
          font-medium
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>


      <p
        className={`
          mt-1
          font-mono
          text-sm
          font-semibold
          ${
            highlight
              ? 'text-blue-600'
              : 'text-slate-800'
          }
        `}
      >
        {value}
      </p>

    </div>

  );

}
'use client';

import Link from 'next/link';
import {
  useState,
} from 'react';


// =====================================================
// TYPES
// =====================================================

type SyncStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';


// =====================================================
// PAGE
// =====================================================

export default function SyncPage() {

  // ---------------------------------------------------
  // DOWNLOAD
  // ---------------------------------------------------

  const [
    downloadStatus,
    setDownloadStatus,
  ] =
    useState<SyncStatus>('idle');

  const [
    downloadMessage,
    setDownloadMessage,
  ] =
    useState('');


  // ---------------------------------------------------
  // UPLOAD
  // ---------------------------------------------------

  const [
    uploadStatus,
    setUploadStatus,
  ] =
    useState<SyncStatus>('idle');

  const [
    uploadMessage,
    setUploadMessage,
  ] =
    useState('');


  // ===================================================
  // DOWNLOAD / FETCH DATA
  // ===================================================

  async function handleDownload() {

    if (
      downloadStatus === 'loading'
    ) {
      return;
    }

    try {

      setDownloadStatus(
        'loading'
      );

      setDownloadMessage(
        'Fetching latest data...'
      );


      const res =
        await window.posApi.syncAll();


      console.log(
        'DOWNLOAD SYNC RESULT',
        res
      );


      setDownloadStatus(
        'success'
      );

      setDownloadMessage(
        'Latest data downloaded successfully.'
      );

    } catch (error) {

      console.error(
        'DOWNLOAD SYNC FAILED',
        error
      );


      setDownloadStatus(
        'error'
      );

      setDownloadMessage(
        error instanceof Error
          ? error.message
          : 'Failed to download data.'
      );

    }

  }


  // ===================================================
  // UPLOAD ORDERS
  // ===================================================

  async function handleUpload() {

    if (
      uploadStatus === 'loading'
    ) {
      return;
    }

    try {

      setUploadStatus(
        'loading'
      );

      setUploadMessage(
        'Uploading pending orders...'
      );


      const res =
        await window.posApi.uploadOrders();


      console.log(
        'ORDER UPLOAD RESULT',
        res
      );


      if (
        res?.success === false
      ) {

        // throw new Error(
        //   res?.message ||
        //   'Order upload failed.'
        // );

      }


      const synced =
        Number(
          res?.synced || 0
        );


      setUploadStatus(
        'success'
      );


      if (
        synced === 0
      ) {

        setUploadMessage(
          'No pending orders to upload.'
        );

      } else {

        setUploadMessage(
          `${synced} order${
            synced === 1
              ? ''
              : 's'
          } uploaded successfully.`
        );

      }

    } catch (error) {

      console.error(
        'ORDER UPLOAD FAILED',
        error
      );


      setUploadStatus(
        'error'
      );


      setUploadMessage(
        error instanceof Error
          ? error.message
          : 'Failed to upload orders.'
      );

    }

  }


  // ===================================================
  // ANY SYNC RUNNING
  // ===================================================

  const isSyncing =
    downloadStatus === 'loading' ||
    uploadStatus === 'loading';


  // ===================================================
  // UI
  // ===================================================

  return (

    <div
      className="
        min-h-full
        bg-slate-100
        px-4
        py-4
        md:px-6
        md:py-5
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-4xl
        "
      >


        {/* =================================================
            ANDROID STYLE APP BAR
        ================================================= */}

        <div
          className="
            mb-5
            flex
            min-h-[56px]
            items-center
            gap-3
            rounded-xl
            bg-white
            px-4
            shadow-sm
            ring-1
            ring-slate-200
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-900
              text-white
            "
          >

            <SyncIcon
              size={20}
            />

          </div>


          {/* TITLE */}

          <div
            className="
              min-w-0
              flex-1
            "
          >

            <h1
              className="
                text-[17px]
                font-semibold
                leading-tight
                text-slate-900
              "
            >
              Data Sync
            </h1>

            <p
              className="
                mt-0.5
                text-[12px]
                text-slate-500
              "
            >
              Sync POS data with cloud
            </p>

          </div>


          {/* GLOBAL STATUS */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-slate-50
              px-3
              py-1.5
            "
          >
             <span
              className="
                hidden
                text-[11px]
                font-medium
                text-slate-500
                sm:block
              "
            >
             <Link href={"/settings/init"}>Init</Link>
            </span>

            <StatusDot
              status={
                isSyncing
                  ? 'loading'
                  : 'idle'
              }
            />

            <span
              className="
                hidden
                text-[11px]
                font-medium
                text-slate-500
                sm:block
              "
            >
              {isSyncing
                ? 'Syncing'
                : 'Ready'}
            </span>

          </div>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            space-y-4
          "
        >


          {/* =================================================
              FETCH DATA
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-sm
              ring-1
              ring-slate-200
            "
          >

            {/* SECTION HEADER */}

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                px-4
                py-4
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >

                <DownloadIcon />

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <h2
                    className="
                      text-[16px]
                      font-semibold
                      text-slate-900
                    "
                  >
                    Fetch Data
                  </h2>

                  <StatusDot
                    status={
                      downloadStatus
                    }
                  />

                </div>


                <p
                  className="
                    mt-0.5
                    text-[12px]
                    leading-5
                    text-slate-500
                  "
                >
                  Download latest data from cloud
                </p>

              </div>

            </div>


            {/* SECTION BODY */}

            <div
              className="
                px-4
                py-4
              "
            >

              {/* INFO ROW */}

              <div
                className="
                  mb-4
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  bg-blue-50/70
                  px-3.5
                  py-3
                "
              >

                <div
                  className="
                    mt-0.5
                    shrink-0
                    text-blue-600
                  "
                >

                  <InfoIcon />

                </div>


                <div>

                  <p
                    className="
                      text-[13px]
                      font-medium
                      text-blue-900
                    "
                  >
                    Refresh local POS data
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-5
                      text-blue-700
                    "
                  >
                    Products, categories, settings
                    and other configured cloud data
                    will be refreshed.
                  </p>

                </div>

              </div>


              {/* MESSAGE */}

              {downloadMessage && (

                <SyncMessage
                  status={
                    downloadStatus
                  }
                  message={
                    downloadMessage
                  }
                />

              )}


              {/* BUTTON */}

              <button
                type="button"
                onClick={
                  handleDownload
                }
                disabled={
                  downloadStatus ===
                  'loading'
                }
                className="
                  mt-4
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  transition
                  active:scale-[0.99]
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {downloadStatus ===
                'loading' ? (

                  <>

                    <Spinner />

                    Fetching data...

                  </>

                ) : (

                  <>

                    <DownloadIcon
                      size={18}
                    />

                    Reload Data

                  </>

                )}

              </button>

            </div>

          </section>


          {/* =================================================
              UPLOAD ORDERS
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-sm
              ring-1
              ring-slate-200
            "
          >

            {/* SECTION HEADER */}

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                px-4
                py-4
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                "
              >

                <UploadIcon />

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <h2
                    className="
                      text-[16px]
                      font-semibold
                      text-slate-900
                    "
                  >
                    Upload Orders
                  </h2>

                  <StatusDot
                    status={
                      uploadStatus
                    }
                  />

                </div>


                <p
                  className="
                    mt-0.5
                    text-[12px]
                    leading-5
                    text-slate-500
                  "
                >
                  Send completed orders to cloud
                </p>

              </div>

            </div>


            {/* SECTION BODY */}

            <div
              className="
                px-4
                py-4
              "
            >

              {/* INFO ROW */}

              <div
                className="
                  mb-4
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  bg-emerald-50/70
                  px-3.5
                  py-3
                "
              >

                <div
                  className="
                    mt-0.5
                    shrink-0
                    text-emerald-600
                  "
                >

                  <InfoIcon />

                </div>


                <div>

                  <p
                    className="
                      text-[13px]
                      font-medium
                      text-emerald-900
                    "
                  >
                    Safe offline upload
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-5
                      text-emerald-700
                    "
                  >
                    Pending orders, items and
                    payments are uploaded and marked
                    as synced after success.
                  </p>

                </div>

              </div>


              {/* MESSAGE */}

              {uploadMessage && (

                <SyncMessage
                  status={
                    uploadStatus
                  }
                  message={
                    uploadMessage
                  }
                />

              )}


              {/* BUTTON */}

              <button
                type="button"
                onClick={
                  handleUpload
                }
                disabled={
                  uploadStatus ===
                  'loading'
                }
                className="
                  mt-4
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  transition
                  active:scale-[0.99]
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {uploadStatus ===
                'loading' ? (

                  <>

                    <Spinner />

                    Uploading orders...

                  </>

                ) : (

                  <>

                    <UploadIcon
                      size={18}
                    />

                    Upload Orders

                  </>

                )}

              </button>

            </div>

          </section>


          {/* =================================================
              SYNC ORDER INFO
          ================================================= */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              bg-white
              px-4
              py-3.5
              shadow-sm
              ring-1
              ring-slate-200
            "
          >

            <div
              className="
                mt-0.5
                shrink-0
                text-slate-400
              "
            >

              <InfoIcon />

            </div>


            <p
              className="
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              Recommended: upload pending orders
              before fetching fresh cloud data. The
              POS continues working offline while
              pending data remains safely stored in
              local SQLite.
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}


// =====================================================
// STATUS DOT
// =====================================================

function StatusDot({
  status,
}: {
  status: SyncStatus;
}) {

  if (
    status === 'loading'
  ) {

    return (
      <span
        className="
          h-2
          w-2
          animate-pulse
          rounded-full
          bg-amber-400
        "
      />
    );

  }


  if (
    status === 'success'
  ) {

    return (
      <span
        className="
          h-2
          w-2
          rounded-full
          bg-emerald-500
        "
      />
    );

  }


  if (
    status === 'error'
  ) {

    return (
      <span
        className="
          h-2
          w-2
          rounded-full
          bg-red-500
        "
      />
    );

  }


  return (
    <span
      className="
        h-2
        w-2
        rounded-full
        bg-slate-300
      "
    />
  );

}


// =====================================================
// MESSAGE
// =====================================================

function SyncMessage({
  status,
  message,
}: {
  status: SyncStatus;
  message: string;
}) {

  const classes =
    status === 'error'
      ? 'bg-red-50 text-red-700 ring-red-100'
      : status === 'success'
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
        : 'bg-slate-50 text-slate-600 ring-slate-100';


  return (

    <div
      className={`
        flex
        items-center
        rounded-xl
        px-3.5
        py-2.5
        text-[12px]
        ring-1
        ${classes}
      `}
    >

      {message}

    </div>

  );

}


// =====================================================
// SPINNER
// =====================================================

function Spinner() {

  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-white/40
        border-t-white
      "
    />
  );

}


// =====================================================
// SYNC ICON
// =====================================================

function SyncIcon({
  size = 20,
}: {
  size?: number;
}) {

  return (

    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="M20 11a8.1 8.1 0 0 0-14.8-4L3 9"
      />

      <path
        d="M3 4v5h5"
      />

      <path
        d="M4 13a8.1 8.1 0 0 0 14.8 4L21 15"
      />

      <path
        d="M21 20v-5h-5"
      />

    </svg>

  );

}


// =====================================================
// DOWNLOAD ICON
// =====================================================

function DownloadIcon({
  size = 21,
}: {
  size?: number;
}) {

  return (

    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="M12 3v12"
      />

      <path
        d="m7 10 5 5 5-5"
      />

      <path
        d="M5 21h14"
      />

    </svg>

  );

}


// =====================================================
// UPLOAD ICON
// =====================================================

function UploadIcon({
  size = 21,
}: {
  size?: number;
}) {

  return (

    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="M12 21V8"
      />

      <path
        d="m17 13-5-5-5 5"
      />

      <path
        d="M5 3h14"
      />

    </svg>

  );

}


// =====================================================
// INFO ICON
// =====================================================

function InfoIcon() {

  return (

    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        d="M12 11v5"
      />

      <path
        d="M12 8h.01"
      />

    </svg>

  );

}
'use client';

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

    if (downloadStatus === 'loading') {
      return;
    }

    try {

      setDownloadStatus('loading');

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

    if (uploadStatus === 'loading') {
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
        //   res?.message! ||
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


      if (synced === 0) {

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
  // UI
  // ===================================================

  return (

    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-6xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-900
                text-white
                shadow-lg
              "
            >

              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Data Sync
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Manage data synchronization between
                this POS and the cloud.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            STATUS OVERVIEW
        ================================================= */}

        <div
          className="
            mb-6
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >

          {/* DOWNLOAD STATUS */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >

                  ↓

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Cloud → POS
                  </p>

                  <p
                    className="
                      mt-0.5
                      font-semibold
                      text-slate-900
                    "
                  >
                    Download Data
                  </p>

                </div>

              </div>


              <StatusDot
                status={
                  downloadStatus
                }
              />

            </div>

          </div>


          {/* UPLOAD STATUS */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >

                  ↑

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    POS → Cloud
                  </p>

                  <p
                    className="
                      mt-0.5
                      font-semibold
                      text-slate-900
                    "
                  >
                    Upload Orders
                  </p>

                </div>

              </div>


              <StatusDot
                status={
                  uploadStatus
                }
              />

            </div>

          </div>

        </div>


        {/* =================================================
            MAIN CARDS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-2
          "
        >


          {/* =================================================
              DOWNLOAD CARD
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-3xl
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
                p-6
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <div
                    className="
                      mb-3
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >

                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >

                      <path
                        d="M12 3v13"
                      />

                      <path
                        d="m7 11 5 5 5-5"
                      />

                      <path
                        d="M5 21h14"
                      />

                    </svg>

                  </div>


                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Fetch Data
                  </h2>


                  <p
                    className="
                      mt-1
                      max-w-md
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Download the latest products,
                    categories, settings and other
                    cloud data required by this POS.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6">

              <div
                className="
                  mb-5
                  rounded-2xl
                  bg-slate-50
                  p-4
                "
              >

                <div
                  className="
                    flex
                    gap-3
                  "
                >

                  <div
                    className="
                      mt-0.5
                      text-blue-500
                    "
                  >
                    ●
                  </div>

                  <div>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      Refresh local POS data
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      Existing local data will be
                      updated from the configured
                      Firestore data sources.
                    </p>

                  </div>

                </div>

              </div>


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


              <button
                onClick={
                  handleDownload
                }
                disabled={
                  downloadStatus ===
                  'loading'
                }
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-slate-900
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-slate-800
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
                    <span>
                      Reload Data
                    </span>

                    <span>
                      →
                    </span>
                  </>

                )}

              </button>

            </div>

          </section>


          {/* =================================================
              UPLOAD CARD
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-3xl
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
                p-6
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <div
                    className="
                      mb-3
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-600
                    "
                  >

                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
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

                  </div>


                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Upload Orders
                  </h2>


                  <p
                    className="
                      mt-1
                      max-w-md
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Send completed local orders,
                    payments and sales information
                    to Firestore.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6">

              <div
                className="
                  mb-5
                  rounded-2xl
                  bg-emerald-50
                  p-4
                "
              >

                <div
                  className="
                    flex
                    gap-3
                  "
                >

                  <div
                    className="
                      mt-0.5
                      text-emerald-600
                    "
                  >
                    ●
                  </div>

                  <div>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-emerald-900
                      "
                    >
                      Safe offline upload
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-emerald-700
                      "
                    >
                      Only orders marked as PENDING
                      are uploaded. Successfully
                      uploaded orders are marked
                      SYNCED locally.
                    </p>

                  </div>

                </div>

              </div>


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


              <button
                onClick={
                  handleUpload
                }
                disabled={
                  uploadStatus ===
                  'loading'
                }
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-emerald-600
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
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
                    <span>
                      Upload Orders
                    </span>

                    <span>
                      ↑
                    </span>
                  </>

                )}

              </button>

            </div>

          </section>

        </div>


        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-4
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                mt-0.5
                text-slate-400
              "
            >
              ⓘ
            </div>

            <p
              className="
                text-xs
                leading-5
                text-slate-500
              "
            >
              For best results, upload orders before
              downloading fresh cloud data. The POS
              continues working offline and keeps
              pending orders in local SQLite until
              they are successfully uploaded.
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
          h-2.5
          w-2.5
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
          h-2.5
          w-2.5
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
          h-2.5
          w-2.5
          rounded-full
          bg-red-500
        "
      />
    );

  }


  return (
    <span
      className="
        h-2.5
        w-2.5
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
      ? 'bg-red-50 text-red-700 border-red-100'
      : status === 'success'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-slate-50 text-slate-600 border-slate-100';


  return (

    <div
      className={`
        rounded-xl
        border
        px-4
        py-3
        text-xs
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
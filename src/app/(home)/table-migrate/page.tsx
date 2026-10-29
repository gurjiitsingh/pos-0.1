'use client';

import { useState } from "react";

export default function Page() {
  const [reason, setReason] = useState("");
  const [cancelKitchen, setCancelKitchen] = useState(false);

  const [migrateOpen, setMigrateOpen] = useState(true);

  const [tables, setTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // SOURCE TABLE
  const [sourceTableNo, setSourceTableNo] =
    useState("");

  const [sourceTableName, setSourceTableName] =
    useState("");

  // DESTINATION TABLE
  const [selectedTableNo, setSelectedTableNo] =
    useState("");

  const [targetTableNo, setTargetTableNo] =
    useState("");

  const [targetTableName, setTargetTableName] =
    useState("");

  // --------------------------------------------------
  // LOAD TABLES
  // --------------------------------------------------

  async function loadTables() {
    try {
      setLoadingTables(true);

      const rows =
        await window.posApi.getTables();

      console.log(
        "========== GET TABLES RESULT =========="
      );

      console.log("ROWS:", rows);

      if (Array.isArray(rows)) {
        rows.forEach((table, index) => {
          // console.log(
          //   `TABLE [${index}]`,
          //   table
          // );
        }
      );

        setTables(rows);
      } else {
        setTables([]);
      }
    } catch (e) {
      console.error(
        "Failed to load tables",
        e
      );

      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  }

  // --------------------------------------------------
  // SELECT SOURCE TABLE
  // --------------------------------------------------

  function handleSelectSourceTable(
    table: any
  ) {
    if (migrating) {
      return;
    }

    const tableNo = String(table.id);

    console.log(
      "SELECT SOURCE TABLE:",
      tableNo
    );

    setSourceTableNo(tableNo);

    setSourceTableName(
      table.tableName || tableNo
    );

    // Clear previous destination
    setSelectedTableNo("");
    setTargetTableNo("");
    setTargetTableName("");
  }

  // --------------------------------------------------
  // SELECT DESTINATION TABLE
  // --------------------------------------------------

  function handleSelectDestinationTable(
    table: any
  ) {
    if (migrating) {
      return;
    }

    const tableNo = String(table.id);

    // Cannot select source as destination
    if (
      tableNo ===
      String(sourceTableNo)
    ) {
      return;
    }

    console.log(
      "SELECT DESTINATION TABLE:",
      tableNo
    );

    setSelectedTableNo(tableNo);

    setTargetTableNo(tableNo);

    setTargetTableName(
      table.tableName || tableNo
    );
  }

  // --------------------------------------------------
  // SAVE / MIGRATE FULL TABLE
  // --------------------------------------------------

  async function handleMigrate() {
    if (!sourceTableNo) {
      console.error(
        "Please select source table"
      );
      return;
    }

    if (!selectedTableNo) {
      console.error(
        "Please select destination table"
      );
      return;
    }

    if (
      String(sourceTableNo) ===
      String(selectedTableNo)
    ) {
      console.error(
        "Source and destination cannot be same"
      );
      return;
    }

    try {
      setMigrating(true);

      // console.log(
      //   "========================================"
      // );

      // console.log(
      //   "FULL TABLE MIGRATION"
      // );

      // console.log(
      //   "SOURCE TABLE:",
      //   sourceTableNo
      // );

      // console.log(
      //   "SOURCE NAME:",
      //   sourceTableName
      // );

      // console.log(
      //   "DESTINATION TABLE:",
      //   selectedTableNo
      // );

      // console.log(
      //   "DESTINATION NAME:",
      //   targetTableName
      // );

      // console.log(
      //   "========================================"
      // );

      const result =
        await window.posApi.moveFullTableToTable(
          {
            sourceTableNo:
              String(sourceTableNo),

            sourceTableName:
              sourceTableName,

            destinationTableNo:
              String(selectedTableNo),

            destinationTableName:
              targetTableName,
          }
        );

      // console.log(
      //   "========== FULL TABLE MIGRATION RESULT =========="
      // );

      console.log(
        "RESULT:",
        result
      );

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "Failed to migrate table"
        );
      }

      // console.log(
      //   "TABLE MIGRATED SUCCESSFULLY"
      // );

      // Reset
      setSourceTableNo("");
      setSourceTableName("");

      setSelectedTableNo("");
      setTargetTableNo("");
      setTargetTableName("");

      /*
       * When this code is placed inside Bill.tsx,
       * call your existing:
       *
       * await loadBillItems();
       *
       * here.
       */

      await loadTables();

    } catch (e) {
      console.error(
        "Failed to migrate full table",
        e
      );
    } finally {
      setMigrating(false);
    }
  }

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  if (migrateOpen && tables.length === 0 && !loadingTables) {
    loadTables();
  }

  return (
 
          <div
            className="
              w-full
              max-full
              max-h-[90vh]
              overflow-y-auto
              rounded-xl
              bg-white
              p-4
            "
          >

            {/* ===================================== */}
            {/* HEADER                                */}
            {/* ===================================== */}

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-gray-800
                  "
                >
                  Migrate Table
                </h2>

                <div
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Select source table and destination table
                </div>

              </div>

              <button
                type="button"
                disabled={migrating}
                onClick={() => {
                  setMigrateOpen(false);

                  setSourceTableNo("");
                  setSourceTableName("");

                  setSelectedTableNo("");
                  setTargetTableNo("");
                  setTargetTableName("");
                }}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-lg
                  font-bold
                  text-gray-600
                  hover:bg-gray-200
                "
              >
                ×
              </button>

            </div>


            {/* ===================================== */}
            {/* SOURCE / DESTINATION DISPLAY         */}
            {/* ===================================== */}

            <div
              className="
                mb-4
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >

              {/* SOURCE */}

              <div
                className="
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  p-3
                "
              >

                <div
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    text-gray-500
                  "
                >
                  From Table
                </div>

                <div
                  className="
                    mt-1
                    text-base
                    font-bold
                    text-gray-800
                  "
                >
                  {sourceTableNo
                    ? sourceTableName ||
                      sourceTableNo
                    : "Select Source Table"}
                </div>

              </div>


              {/* DESTINATION */}

              <div
                className="
                  rounded-lg
                  border
                  border-[#9C27B0]
                  bg-[#9C27B0]/5
                  p-3
                "
              >

                <div
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    text-gray-500
                  "
                >
                  Destination Table
                </div>

                <div
                  className="
                    mt-1
                    text-base
                    font-bold
                    text-[#9C27B0]
                  "
                >
                  {selectedTableNo
                    ? targetTableName ||
                      selectedTableNo
                    : "Select Destination Table"}
                </div>

              </div>

            </div>


            {/* ===================================== */}
            {/* INSTRUCTION                           */}
            {/* ===================================== */}

            {!sourceTableNo && (
              <div
                className="
                  mb-3
                  rounded-lg
                  bg-gray-100
                  px-4
                  py-2.5
                  text-center
                  text-sm
                  font-medium
                  text-gray-600
                "
              >
                Select the source table first
              </div>
            )}

            {sourceTableNo &&
              !selectedTableNo && (
                <div
                  className="
                    mb-3
                    rounded-lg
                    bg-[#9C27B0]/10
                    px-4
                    py-2.5
                    text-center
                    text-sm
                    font-medium
                    text-[#9C27B0]
                  "
                >
                  Now select the destination table
                </div>
              )}


            {/* ===================================== */}
            {/* TABLE LOADING                         */}
            {/* ===================================== */}

            {loadingTables ? (
              <div
                className="
                  flex
                  h-[200px]
                  items-center
                  justify-center
                  text-sm
                  text-gray-500
                "
              >
                Loading tables...
              </div>
            ) : (

              /* ================================= */
              /* TABLE GRID                         */
              /* ================================= */

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  md:grid-cols-9
                "
              >

                {tables.map((table) => {

                  const tableNo =
                    String(table.id);

                  const isSource =
                    sourceTableNo ===
                    tableNo;

                  const isDestination =
                    selectedTableNo ===
                    tableNo;


                  /*
                   * SOURCE SELECTED
                   *
                   * Purple
                   */

                  const tableColor =
                    isSource
                      ? "#9C27B0"
                      : isDestination
                        ? "#9C27B0"
                        : table.billCount > 0
                          ? "#E57373"
                          : table.kitchenCount > 0
                            ? "#81C784"
                            : table.cartCount > 0
                              ? "#64B5F6"
                              : "#F5F5F5";


                  const textColor =
                    isSource ||
                    isDestination ||
                    table.billCount > 0 ||
                    table.kitchenCount > 0 ||
                    table.cartCount > 0
                      ? "#FFFFFF"
                      : "#333333";


                  const statusText =
                    isSource
                      ? "FROM"
                      : isDestination
                        ? "TO"
                        : table.billCount > 0
                          ? "BILL"
                          : table.kitchenCount > 0
                            ? "KITCHEN"
                            : table.cartCount > 0
                              ? `${table.cartCount} ITEMS`
                              : "AVAILABLE";


                  return (
                    <button
                      key={table.id}
                      type="button"
                      disabled={migrating}
                      onClick={() => {

                        /*
                         * STEP 1:
                         * No source selected
                         * -> select source
                         */

                        if (!sourceTableNo) {
                          handleSelectSourceTable(
                            table
                          );

                          return;
                        }


                        /*
                         * STEP 2:
                         * Source selected
                         * -> select destination
                         */

                        if (
                          tableNo ===
                          sourceTableNo
                        ) {
                          return;
                        }

                        handleSelectDestinationTable(
                          table
                        );

                      }}
                      className="
                        relative
                        h-[90px]
                        w-full
                        overflow-hidden
                        rounded-[10px]
                        border
                        transition-all
                        duration-150
                        cursor-pointer
                        hover:scale-[1.01]
                        disabled:cursor-not-allowed
                      "
                      style={{
                        background:
                          tableColor,

                        color:
                          textColor,

                        borderColor:
                          isSource ||
                          isDestination
                            ? "#9C27B0"
                            : "transparent",

                        boxShadow:
                          isSource ||
                          isDestination
                            ? "0 0 0 2px rgba(156,39,176,0.2)"
                            : "0 2px 6px rgba(0,0,0,0.12)",
                      }}
                    >

                      <div
                        className="
                          flex
                          h-full
                          flex-col
                          items-center
                          justify-center
                        "
                      >

                        <span
                          className="
                            text-[17px]
                            font-bold
                            leading-tight
                          "
                        >
                          {table.tableName ||
                            tableNo}
                        </span>

                        <span
                          className="
                            mt-1
                            text-[10px]
                            font-medium
                            opacity-90
                          "
                        >
                          {statusText}
                        </span>

                      </div>


                      {/* CHECK MARK */}

                      {(isSource ||
                        isDestination) && (
                        <span
                          className="
                            absolute
                            right-2
                            top-2
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-white/20
                            text-[12px]
                            font-bold
                          "
                        >
                          ✓
                        </span>
                      )}

                    </button>
                  );
                })}

              </div>
            )}


            {/* ===================================== */}
            {/* SAVE / CANCEL                         */}
            {/* ===================================== */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-gray-200
                pt-4
              "
            >

              <button
                type="button"
                disabled={migrating}
                onClick={() => {
                  setMigrateOpen(false);

                  setSourceTableNo("");
                  setSourceTableName("");

                  setSelectedTableNo("");
                  setTargetTableNo("");
                  setTargetTableName("");
                }}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  migrating ||
                  !sourceTableNo ||
                  !selectedTableNo
                }
                onClick={handleMigrate}
                className="
                  rounded-lg
                  bg-[#9C27B0]
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {migrating
                  ? "Migrating..."
                  : "Save"}
              </button>

            </div>

          </div>
      
       
   
  );
}
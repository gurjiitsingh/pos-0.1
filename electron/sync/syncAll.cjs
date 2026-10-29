async function runStep(name, fn) {

  console.log(`\n========== ${name} START ==========`);

  const start = Date.now();

  try {

    const result = await fn();

    console.log(
      `✅ ${name} SUCCESS in ${Date.now() - start}ms`
    );

    if (result !== undefined) {
      console.log(
        `${name} RESULT:`,
        result
      );
    }

    console.log(
      `========== ${name} END ==========\n`
    );

    return result;

  } catch (err) {

    console.error(
      `❌ ${name} FAILED`
    );

    console.error(err);

    throw err;
  }
}


async function syncAll() {

  console.log("\n==============================");
  console.log("🚀 FULL SYNC STARTED");
  console.log("==============================\n");


  const startedAt = Date.now();


  try {

    // ==========================================
    // INITIALIZE FIREBASE AFTER DB EXISTS
    // ==========================================

    const {
      initializeFirebase,
    } = require("../lib/firebaseClient.cjs");

    initializeFirebase();


    // ==========================================
    // LOAD SYNC MODULES AFTER FIREBASE IS READY
    // ==========================================

    const {
      syncCategories,
    } = require("./categorySync.cjs");

    const {
      syncProducts,
    } = require("./productSync.cjs");

    const {
      syncTables,
    } = require("./tableSync.cjs");

    const {
      syncUsers,
    } = require("./userSync.cjs");

    const {
      syncOutlet,
    } = require("./outletSync.cjs");

    const {
      syncOrderCounter,
    } = require("./orderCounterSync.cjs");

    const {
      syncModifierGroups,
      syncModifierItems,
      syncProductModifiers,
    } = require("./modifierSync.cjs");


    // ==========================================
    // RUN SYNC
    // ==========================================

    await runStep(
      "CATEGORIES",
      syncCategories
    );

    await runStep(
      "PRODUCTS",
      syncProducts
    );

    await runStep(
      "MODIFIER GROUPS",
      syncModifierGroups
    );

    await runStep(
      "MODIFIER ITEMS",
      syncModifierItems
    );

    await runStep(
      "PRODUCT MODIFIERS",
      syncProductModifiers
    );

    await runStep(
      "TABLES",
      syncTables
    );

    await runStep(
      "USERS",
      syncUsers
    );

    await runStep(
      "OUTLET",
      syncOutlet
    );

    await runStep(
      "ORDER COUNTER",
      syncOrderCounter
    );


    console.log("\n==============================");
    console.log(
      `🎉 FULL SYNC COMPLETED in ${
        Date.now() - startedAt
      }ms`
    );
    console.log("==============================\n");


    return {
      success: true,
    };


  } catch (e) {

    console.error(
      "\n=============================="
    );

    console.error(
      "💥 FULL SYNC FAILED"
    );

    console.error(
      "=============================="
    );

    console.error(e);


    return {
      success: false,
      error: e?.message || String(e),
    };
  }
}


module.exports = {
  syncAll,
};
const os = require('os');

const {
  doc,
  setDoc,
} = require('firebase/firestore');

const {
  initializeFirebase,
} = require('../lib/firebaseClient.cjs');

const {
  db,
} = require('../db/sqlite.cjs');

// =====================================================
// CONFIG
// =====================================================

const POS_PORT = 2345;

// =====================================================
// GET LOCAL POS IP
// =====================================================

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const addresses = interfaces[name] || [];

    for (const address of addresses) {
      const isIPv4 =
        address.family === 'IPv4' ||
        address.family === 4;

      if (isIPv4 && !address.internal) {
        return address.address;
      }
    }
  }

  return '';
}

// =====================================================
// GET OUTLET
// =====================================================

function getLocalOutlet() {
  const outlet = db.prepare(`
    SELECT
      outletId,
      outletName,
      ownerId
    FROM outlet
    LIMIT 1
  `).get();

  return outlet || null;
}

// =====================================================
// REGISTER POS TERMINAL
// =====================================================

async function registerPosTerminal() {
  try {
    // Initialize Firebase before using Firestore.
    const firestore = initializeFirebase();

    // ===============================================
    // GET LOCAL OUTLET
    // ===============================================

    const outlet = getLocalOutlet();

    if (!outlet) {
      throw new Error(
        'Outlet configuration not found.'
      );
    }

    if (!outlet.outletId) {
      throw new Error(
        'Outlet ID is required.'
      );
    }

    // ===============================================
    // GET LOCAL IP ADDRESS
    // ===============================================

    const ipAddress = getLocalIPAddress();

    if (!ipAddress) {
      throw new Error(
        'Could not detect local network IP address.'
      );
    }

    // ===============================================
    // TERMINAL ID
    // ===============================================

    const terminalId = 'POS-02';

    // ===============================================
    // TERMINAL DATA
    // ===============================================

    const now = Date.now();

    const terminal = {
      terminalId,

      terminalName: outlet.outletName
        ? `${outlet.outletName} POS`
        : 'Main POS',

      outletId: outlet.outletId,

      ownerId: outlet.ownerId || '',

      ipAddress,

      port: POS_PORT,

      deviceType: 'POS',

      isActive: true,

      lastSeenAt: now,

      updatedAt: now,
    };

    // ===============================================
    // FIRESTORE DOCUMENT REFERENCE
    // ===============================================

    const terminalRef = doc(
      firestore,
      'posTerminals',
      terminalId
    );

    // ===============================================
    // SAVE / UPDATE TERMINAL
    // ===============================================

    await setDoc(terminalRef, terminal, {
      merge: true,
    });

    // ===============================================
    // SUCCESS LOG
    // ===============================================

    console.log('========================================');
    console.log('POS TERMINAL REGISTERED');
    console.log('TERMINAL ID:', terminalId);
    console.log('OUTLET ID:', outlet.outletId);
    console.log('IP ADDRESS:', ipAddress);
    console.log('PORT:', POS_PORT);
    console.log('========================================');

    return {
      success: true,
      terminal,
      outletId: outlet.outletId,
    };
  } catch (error) {
    console.error(
      'registerPosTerminal error:',
      error
    );

    throw error;
  }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerPosTerminal,
  getLocalIPAddress,
};
 
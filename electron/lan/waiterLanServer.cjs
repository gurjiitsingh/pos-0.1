const http = require('http');
const tableRepo = require('../db/tableRepo.cjs');
const kotRepo = require('../db/kotRepo.cjs');
const billItemRepo = require('../db/billItemRepo.cjs');
const {
  printManager,
} = require('../../shared/printer/PrintManager.cjs');
const { BrowserWindow } = require('electron');
const HOST = '0.0.0.0';
const PORT = 2345;

let server = null;

// =====================================================
// HELPERS
// =====================================================

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

// =====================================================
// VALIDATE
// =====================================================

function validateWaiterKot(payload) {

  if (!payload) {
    throw new Error('Request body is required');
  }

  if (!payload.batch) {
    throw new Error('batch is required');
  }

  if (!payload.batch.id) {
    throw new Error('batch.id is required');
  }

  if (!payload.batch.tableNo) {
    throw new Error('batch.tableNo is required');
  }

  if (!payload.batch.businessDate) {
    throw new Error('businessDate is required');
  }

  if (
    !Array.isArray(payload.items) ||
    payload.items.length === 0
  ) {
    throw new Error('items are required');
  }

  for (const item of payload.items) {

    if (!item.productId) {
      throw new Error('item.productId is required');
    }

    if (!item.name) {
      throw new Error('item.name is required');
    }

    if (
      item.quantity === undefined ||
      item.quantity === null ||
      Number(item.quantity) <= 0
    ) {
      throw new Error(
        `Invalid quantity for ${item.name}`
      );
    }
  }
}

// =====================================================
// NORMALIZE BATCH
// =====================================================

function normalizeBatch(batch) {

  const now = Date.now();

  return {

    id:
      String(batch.id),

    kotNumber:
      batch.kotNumber || '',

    sessionId:
      batch.sessionId || 'DEFAULT',

    tableNo:
      batch.tableNo,

    tableName:
      batch.tableName || '',

    orderType:
      batch.orderType || 'DINE_IN',

    businessDate:
      batch.businessDate ||
      new Date(now)
        .toISOString()
        .slice(0, 10),

    deviceId:
      batch.deviceId || 'WAITER',

    deviceName:
      batch.deviceName || 'Waiter',

    appVersion:
      batch.appVersion || '1.0',

    createdAt:
      Number(batch.createdAt || now),

    sentBy:
      batch.sentBy || 'WAITER',

    syncStatus:
      batch.syncStatus || 'PENDING',

    lastSyncedAt:
      batch.lastSyncedAt ?? null,
  };
}

// =====================================================
// NORMALIZE ITEM
// =====================================================

function normalizeItem(
  item,
  batch
) {

  const basePrice =
    Number(item.basePrice ?? 0);

  const modifierTotal =
    Number(item.modifierTotal ?? 0);

  const finalPrice =
    Number(
      item.finalPrice ??
      basePrice + modifierTotal
    );

  return {

    id:
      item.id ||
      `${batch.id}-${item.productId}-${Date.now()}-${Math.random()}`,

    kotNumber:
      batch.kotNumber,

    categoryName:
      item.categoryName || '',

    // REQUIRED BY SQLITE
    productMode:
      item.productMode || 'raw_stock',

    currentStock:
      Number(item.currentStock ?? 0),

    sessionId:
      item.sessionId ||
      batch.sessionId ||
      'DEFAULT',

    kotBatchId:
      batch.id,

    tableNo:
      batch.tableNo,

    tableName:
      batch.tableName || '',

    productId:
      item.productId,

    name:
      item.name || '',

    categoryId:
      item.categoryId || '',

    createdById:
      item.createdById || '',

    createdByName:
      item.createdByName || 'Waiter',

    parentId:
      item.parentId ?? null,

    isVariant:
      Boolean(item.isVariant),

    discountEligible:
      item.discountEligible === true ? 1 : 0,

    basePrice,

    finalPrice,

    modifierTotal,

    quantity:
      Number(item.quantity ?? 0),

    taxRate:
      Number(item.taxRate ?? 0),

    taxType:
      item.taxType || 'exclusive',

    status:
      item.status || 'PENDING',

    note:
      item.note || '',

    modifiersJson:
      item.modifiersJson || '',

    kitchenPrintReq:
      item.kitchenPrintReq !== false,

    kitchenPrinted:
      Boolean(item.kitchenPrinted),

    createdAt:
      Number(
        item.createdAt ||
        batch.createdAt ||
        Date.now()
      ),

    source:
      item.source || 'WAITER',

    syncedToCloud:
      Boolean(item.syncedToCloud),

    syncedFromCloud:
      Boolean(item.syncedFromCloud),
  };
}

// =====================================================
// PING
// =====================================================

function handlePing(req, res) {

  sendJson(res, 200, {

    success: true,

    service: 'POS',

    type: 'WAITER_KOT',

    port: PORT,

    timestamp: Date.now(),

  });
}

// =====================================================
// RECEIVE WAITER KOT
// =====================================================

async function handleWaiterKot(req, res) {

  try {

    const payload =
      await readJsonBody(req);

    console.log(
      '===================================='
    );

   

    console.log(
      'ITEMS:',
      payload?.items?.map(item => (item))
    );

  
    console.log(
      '===================================='
    );

    // =================================================
    // VALIDATE
    // =================================================

    validateWaiterKot(payload);

    // =================================================
    // BATCH
    // =================================================

    const batch =
      normalizeBatch(
        payload.batch
      );

    // =================================================
    // DESKTOP GENERATES KOT NUMBER
    // =================================================

    if (!batch.kotNumber) {

      batch.kotNumber =
        kotRepo.generateNextKotNumber();

    }

    // =================================================
    // ITEMS
    // =================================================

    const items =
      payload.items.map(
        item =>
          normalizeItem(
            item,
            batch
          )
      );

    // =================================================
    // SAVE KOT
    // =================================================

    const result =
      kotRepo.createKot({
        batch,
        items,
      });

    // =================================================
    // INSERT BILL ITEMS
    // =================================================

    const billResult =
      billItemRepo.insertBillItems(
        items
      );





    // =====================================================
    // QUEUE WAITER KOT FOR KITCHEN PRINTING
    // =====================================================

 
    // =====================================================
    // QUEUE WAITER KOT FOR KITCHEN PRINTING
    // Only items with kitchenPrintReq === true are printed.
    // All items are still saved to the KOT and bill.
    // =====================================================

    const kitchenItems = items
      .filter(item => item.kitchenPrintReq === true)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        note: item.note || '',
        createdByName: item.createdByName || '',
      }));

    let printJobId = null;

    if (kitchenItems.length > 0) {
      try {
        printJobId = await printManager.enqueue(
          'KITCHEN',
          {
            kotNumber: result.kotNumber,
            tableNo: batch.tableNo,
            tableName: batch.tableName,
            orderType: batch.orderType,
            createdAt: batch.createdAt || Date.now(),
            createdByName:
              items.find(item => item.createdByName)?.createdByName || '',
            items: kitchenItems,
          },
          'WAITER'
        );

        console.log(
          '[WAITER KOT] Kitchen print job queued:',
          {
            kotNumber: result.kotNumber,
            printJobId,
            itemCount: kitchenItems.length,
            printedItems: kitchenItems.map(item => item.name),
          }
        );
      } catch (printError) {
        console.error(
          '[WAITER KOT] Failed to queue kitchen print:',
          printError
        );
      }
    } else {
      console.log(
        '[WAITER KOT] No items require kitchen printing.'
      );
    }



    // =================================================
    // REFRESH TABLE BILL VISUAL STATES
    // =================================================

    const tables =
      tableRepo.refreshAllTableBillVisualStates();


    for (const win of BrowserWindow.getAllWindows()) {
      // console.log(
      //   'SENDING IPC TO WINDOW:',
      //   win.id
      // );

      win.webContents.send('waiter-kot-received', {
        tableNo: batch.tableNo,
        kotNumber: result.kotNumber,
        itemCount: result.itemCount,
      });
    }

    // =================================================
    // LOG
    // =================================================

    console.log(
      '===================================='
    );

    console.log(
      'WAITER KOT SAVED'
    );

    console.log(
      'KOT NUMBER:',
      result.kotNumber
    );

    console.log(
      'KOT ITEM COUNT:',
      result.itemCount
    );

    console.log(
      'BILL ITEMS INSERTED:',
      billResult?.count
    );

    console.log(
      'TABLE STATES REFRESHED:',
      tables?.length
    );

    console.log(
      '===================================='
    );

    // =================================================
    // RESPONSE
    // =================================================

    sendJson(res, 200, {

      success: true,

      message:
        'Waiter KOT received successfully',

      kotBatchId:
        result.kotBatchId,

      kotNumber:
        result.kotNumber,

      itemCount:
        result.itemCount,

      billItemCount:
        billResult?.count ?? 0,

      source:
        'WAITER',

    });

  } catch (error) {

    console.error(
      'WAITER LAN KOT FAILED:',
      error
    );

    sendJson(res, 400, {

      success: false,

      error:
        error?.message ||
        String(error),

    });
  }
}

// =====================================================
// SERVER
// =====================================================

function createWaiterLanServer() {

  if (server) {
    return server;
  }

  server =
    http.createServer(
      async (req, res) => {

        try {

          if (
            req.method === 'OPTIONS'
          ) {

            res.writeHead(204, {

              'Access-Control-Allow-Origin':
                '*',

              'Access-Control-Allow-Methods':
                'GET, POST, OPTIONS',

              'Access-Control-Allow-Headers':
                'Content-Type',

            });

            res.end();

            return;
          }

          if (
            req.method === 'GET' &&
            req.url ===
            '/api/waiter/ping'
          ) {

            handlePing(
              req,
              res
            );

            return;
          }

          if (
            req.method === 'POST' &&
            req.url ===
            '/api/waiter/kot'
          ) {

            await handleWaiterKot(
              req,
              res
            );

            return;
          }

          sendJson(
            res,
            404,
            {
              success: false,
              error: 'Not found',
            }
          );

        } catch (error) {

          console.error(
            'WAITER LAN SERVER ERROR:',
            error
          );

          if (!res.headersSent) {

            sendJson(
              res,
              500,
              {
                success: false,
                error:
                  error?.message ||
                  'Internal server error',
              }
            );
          }
        }
      }
    );

  server.on(
    'error',
    error => {

      console.error(
        'WAITER LAN SERVER ERROR:',
        error
      );

    }
  );

  server.listen(
    PORT,
    HOST,
    () => {

      console.log(
        '===================================='
      );

      console.log(
        'WAITER LAN SERVER STARTED'
      );

      console.log(
        `Listening on ${HOST}:${PORT}`
      );

      console.log(
        `Ping: http://<DESKTOP-IP>:${PORT}/api/waiter/ping`
      );

      console.log(
        `KOT: http://<DESKTOP-IP>:${PORT}/api/waiter/kot`
      );

      console.log(
        '===================================='
      );
    }
  );

  return server;
}

// =====================================================
// STOP
// =====================================================

function stopWaiterLanServer() {

  if (!server) {
    return;
  }

  server.close(
    () => {

      console.log(
        'WAITER LAN SERVER STOPPED'
      );

    }
  );

  server = null;
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createWaiterLanServer,
  stopWaiterLanServer,
};
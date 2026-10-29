const { initDb } = require('./db/initDb.cjs');

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
} = require('electron');

const { shell } = require('electron');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { syncAll } = require('./sync/syncAll.cjs');
const {
  uploadOrderCounter,
} = require('./sync/orderCounterUpload.cjs');

const {
  syncPendingOrders,
} = require('./sync/orderSyncRepository.cjs');
const {
  registerPosTerminal,
  getLocalIPAddress,
} = require('./sync/posTerminalRepository.cjs');

const {
  getOrCreateOrderNo,
  getExistingOrderNo,
} = require('./lib/orderSequenceRepository.cjs');
const {
  TERMINAL_CODE,
} = require('./lib/orderSequence.cjs');
const {
  db,
  getDebugCounts,
} = require('./db/sqlite.cjs');

const billRepo = require('./db/billItemRepo.cjs');

// const {
//   createWaiterLanServer,
//   stopWaiterLanServer,
// } = require('./waiterLanServer.cjs');

const {
  startWaiterWebSocketServer,
  stopWaiterWebSocketServer,
  notifyBillItemsChanged,
} = require("./lan/waiterWebSocket.cjs");

//const { broadcastLanEvent } = require("./lan/lanBroadcaster.cjs");

const {
  createWaiterLanServer,
  stopWaiterLanServer,
} = require('./lan/waiterLanServer.cjs');


const tableRepo = require('./db/tableRepo.cjs');

const userRepository =
  require('./db/userRepo.cjs');

const {
  getAllUsers,
} = require('./db/userRepo.cjs');

const authRepository =
  require('./db/authRepository.cjs');

const {
  getModifierGroups,
} = require('./db/modifierGroupRepo.cjs');

const cartRepo =
  require('./db/cartRepo.cjs');

const orderRepo =
  require('./db/orderRepo.cjs');

const {
  getProductModifiers,
} = require('./db/productModifierRepo.cjs');

const dayClosingRepo =
  require('./db/dayClosingRepository.cjs');

const businessDayRepo =
  require('./db/businessDayRepository.cjs');

const kotHistoryRepo =
  require('./db/kotHistoryRepository.cjs');

const billItemRepo =
  require('./db/billItemRepo.cjs');



const {
  getOutlet,
} = require('./db/outletRepo.cjs');

const saleReportRepo =
  require('./db/saleReportRepo.cjs');

const {
  getAllCategories,
} = require('./db/categoryRepo.cjs');

const {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  searchExactCode,
} = require('./db/productRepo.cjs');

const kotRepo =
  require('./db/kotRepo.cjs');

const {
  createBillFromKitchen,
  cancelBillFromKitchen,
  getBillableKotItems,
} = require('./db/billingRepo.cjs');

const PosSessionRepository =
  require("./db/posSessionRepository.cjs");

const posSessionRepository =
  new PosSessionRepository(db);

const {
  printManager,
} = require('../shared/printer/PrintManager.cjs');





const {
  fetchClientWebApi,
} = require("./lib/clientWebApi.cjs");

const {
  saveFirebaseConfig,
  getFirebaseConfig,
} = require("./db/firebaseConfigRepo.cjs");



const {
  PrinterSettingsRepository,
} = require(
  '../shared/printer/PrinterSettingsRepository.cjs'
);



const printerSettingsRepo =
  new PrinterSettingsRepository();


console.log('MAIN STARTED');

console.log(
  'USER DATA PATH:',
  app.getPath('userData')
);


function registerIpcHandlers() {




  // =====================================================
  // GENERATE POS ORDER NUMBER
  // TAKEAWAY -> TW1, TW2...
  // DELIVERY -> DL1, DL2...
  // =====================================================

  ipcMain.handle(
    'pos-order:generate-number',
    async (_e, orderType) => {

      try {

        const orderNumber =
          orderRepo.generateNextPosOrderNumber(
            orderType
          );

        return orderNumber;

      } catch (error) {

        console.error(
          'pos-order:generate-number failed',
          error
        );

        throw error;
      }
    }
  );


  // =====================================================
  // GET TODAY'S POS ORDER NUMBERS
  //
  // TAKEAWAY:
  //   TW1, TW2, TW3...
  //
  // DELIVERY:
  //   DL1, DL2, DL3...
  // =====================================================

  ipcMain.handle(
    'pos-order:list',
    async (_e, orderType) => {

      try {

        return await orderRepo.getTodayPosOrderNumbers(
          orderType
        );

      } catch (error) {

        console.error(
          'pos-order:list failed',
          error
        );

        throw error;
      }
    }
  );


  // =====================================================
  // DAY CLOSING SUMMARY
  // =====================================================

  ipcMain.handle(
    'dayClosing:getSummary',
    async (
      _event,
      businessDate
    ) => {

      try {

        const summary =
          dayClosingRepo
            .getSummary(
              businessDate
            );

        return {
          success: true,
          data: summary,
        };

      } catch (e) {

        console.error(
          'GET DAY CLOSING SUMMARY FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );



  // // =====================================================
  // // PRINTER IPC
  // // =====================================================
ipcMain.handle('usb-printer:list-installed', async () => {
  try {
    const win = BrowserWindow.getAllWindows()[0];

    if (!win || win.isDestroyed()) {
      throw new Error('POS window is not available');
    }

    const printers = await win.webContents.getPrintersAsync();

    return printers
      .map((printer) => ({
        name: printer.name,
        displayName: printer.displayName || printer.name,
        status: printer.status,
        isDefault: printer.isDefault === true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(
      '[USB PRINTER] Failed to list installed printers:',
      error
    );

    throw error;
  }
});
 
ipcMain.handle(
  'printer:print',
  async (_event, payload) => {
    try {
      const {
        role,
        data,
        source,
      } = payload;

      const jobId = await printManager.enqueue(
        role,
        data,
        source || 'POS'
      );

      if (role === 'BILL' && data?.tableNo) {
        tableRepo.updateTableStatus(
          data.tableNo,
          'PAYMENT_PENDING'
        );
      }

      return {
        success: true,
        jobId,
      };
    } catch (e) {
      console.error(
        'PRINTER PRINT FAILED',
        e
      );

      return {
        success: false,
        error: e?.message || String(e),
      };
    }
  }
);


  ipcMain.handle(
    'printer:queue-length',
    async () => {
      return printManager.getQueueLength();
    }
  );


  // // =====================================================
  // // PRINTER SETTINGS
  // // =====================================================

  // ipcMain.handle(
  //   'printer-settings:get-all',
  //   async () => {
  //     return printerSettingsRepo.readAll();
  //   }
  // );

  // ipcMain.handle(
  //   'printer-settings:save',
  //   async (_event, config) => {
  //     printerSettingsRepo.saveConfig(
  //       config
  //     );

  //     return {
  //       success: true,
  //     };
  //   }
  // );



  
  // =====================================================
  // PRINTER SETTINGS
  // =====================================================

  ipcMain.handle(
    'printer-settings:get-all',
    async () => {
      return printerSettingsRepo.readAll();
    }
  );

  ipcMain.handle(
    'printer-settings:save',
    async (_event, config) => {
      try {
        if (!config || typeof config !== 'object') {
          throw new Error(
            'Invalid printer configuration'
          );
        }

        const savedConfig =
          printerSettingsRepo.saveConfig(config);

        console.log(
          '[PRINTER SETTINGS] Saved:',
          savedConfig.role,
          savedConfig.connectionType,
          'active:',
          savedConfig.active
        );

        return {
          success: true,
          data: savedConfig,
        };
      } catch (error) {
        console.error(
          '[PRINTER SETTINGS] Save failed:',
          error
        );

        return {
          success: false,
          error:
            error.message ||
            'Failed to save printer settings',
        };
      }
    }
  );

 
// =====================================================
// USB PRINTER SETTINGS
// Uses PrinterSettingsRepository for independent
// connection settings and active printer selection.
// =====================================================

ipcMain.handle(
  'usb-printer:get-settings',
  async () => {
    try {
      const config =
        printerSettingsRepo.getConfigByConnection(
          'BILL',
          'USB'
        );

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      console.error(
        '[USB PRINTER] Failed to load settings:',
        error
      );

      return {
        success: false,
        error:
          error.message ||
          'Failed to load USB printer settings',
      };
    }
  }
);


ipcMain.handle(
  'usb-printer:save-settings',
  async (_event, config) => {
    try {
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid USB printer configuration');
      }

      const role = String(config.role || '').toUpperCase();

      if (!['BILL', 'KITCHEN', 'BAR'].includes(role)) {
        throw new Error(`Invalid USB printer role: ${role || '(missing)'}`);
      }

      const usbConfig = {
        ...config,
        role,
        connectionType: 'USB',
        printerName: config.printerName || 'TVS-E RP 3230',
        ip: '',
        port: config.port ?? 9100,
        active: config.active === true,
      };

      const savedConfig = printerSettingsRepo.saveConfig(usbConfig);

      console.log('[USB PRINTER] Saved:', {
        role: savedConfig.role,
        connectionType: savedConfig.connectionType,
        active: savedConfig.active,
        printerName: savedConfig.printerName,
      });

      return {
        success: true,
        data: savedConfig,
      };
    } catch (error) {
      console.error('[USB PRINTER] Failed to save settings:', error);

      return {
        success: false,
        error: error.message || 'Failed to save USB printer settings',
      };
    }
  }
);

 


  // =====================================================
  // IP
  // =====================================================
  ipcMain.handle(
    'posTerminal:register',
    async () => {

      return await registerPosTerminal();

    }
  );


  ipcMain.handle(
    'posTerminal:getIPAddress',
    async () => {

      return {
        success: true,
        ipAddress:
          getLocalIPAddress(),
      };

    }
  );
  // =====================================================
  // BILL IMAGE PREVIEW IPC
  // =====================================================

  ipcMain.handle(
    'printer:preview-bill-image',
    async (_event, data) => {
      try {
        console.log(
          '[PREVIEW] Generating bill image...'
        );

        const {
          BillImageFormatter80,
        } = require(
          '../shared/printer/formatters/BillImageFormatter80.cjs'
        );

        const formatter =
          new BillImageFormatter80();

        const pngBuffer =
          await formatter.format(data);

        const previewDir =
          path.join(
            app.getPath('temp'),
            'pos-bill-previews'
          );

        if (!fs.existsSync(previewDir)) {
          fs.mkdirSync(
            previewDir,
            { recursive: true }
          );
        }

        const filePath =
          path.join(
            previewDir,
            `bill-preview-${Date.now()}.png`
          );

        fs.writeFileSync(
          filePath,
          pngBuffer
        );

        console.log(
          '[PREVIEW] PNG CREATED:',
          filePath
        );

        return {
          success: true,
          filePath,
        };

      } catch (e) {
        console.error(
          '[PREVIEW] BILL IMAGE FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );


  // =====================================================
  // OPEN BILL IMAGE
  // =====================================================

  ipcMain.handle(
    'printer:open-file',
    async (_event, filePath) => {
      try {
        if (!filePath) {
          throw new Error(
            'Missing file path'
          );
        }

        const errorMessage =
          await shell.openPath(
            filePath
          );

        if (errorMessage) {
          throw new Error(
            errorMessage
          );
        }

        return {
          success: true,
        };

      } catch (e) {
        console.error(
          '[PREVIEW] OPEN FILE FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );


  // =====================================================
  // USERS / OUTLET / TABLES
  // =====================================================

  ipcMain.handle(
    'users:list',
    async () => {
      return getAllUsers();
    }
  );

  ipcMain.handle(
    'outlet:get',
    async () => {
      return getOutlet();
    }
  );

  ipcMain.handle(
    'tables:list',
    async () => {
      return tableRepo.getAllTables();
    }
  );


  // =====================================================
  // DEBUG
  // =====================================================

  ipcMain.handle(
    'debug:counts',
    async () => {
      return getDebugCounts();
    }
  );


  // =====================================================
  // KOT
  // =====================================================

  ipcMain.handle(
    'kot:create',
    async (_e, { batch, items }) => {
      return kotRepo.createKot({
        batch,
        items,
      });
    }
  );

  ipcMain.handle(
    'pos:kot:generateNumber',
    async () => {
      return kotRepo.generateNextKotNumber();
    }
  );

  ipcMain.handle(
    'kot:pending-by-table',
    async (_e, tableNo) => {
      return kotRepo.getPendingKotByTable(
        tableNo
      );
    }
  );

  ipcMain.handle(
    'kot:by-batch',
    async (_e, kotBatchId) => {
      return kotRepo.getKotByBatch(
        kotBatchId
      );
    }
  );

  ipcMain.handle(
    'kot:mark-printed',
    async (_e, kotBatchId) => {
      return kotRepo.markKotPrinted(
        kotBatchId
      );
    }
  );

  ipcMain.handle(
    'kot:update-status',
    async (_e, id, status) => {
      return kotRepo.updateKotStatus(
        id,
        status
      );
    }
  );


  // =====================================================
  // KOT HISTORY
  // =====================================================

  ipcMain.handle(
    'kot-history:create',
    async (_event, data) => {
      return kotHistoryRepo.createKotHistory(
        data
      );
    }
  );

  ipcMain.handle(
    'pos:getKotHistory',
    async (_event, args = {}) => {
      try {
        return {
          success: true,
          data:
            kotHistoryRepo.getKotHistory(
              args
            ),
        };
      } catch (error) {
        console.error(
          'GET KOT HISTORY FAILED',
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            'Failed to load KOT history',
        };
      }
    }
  );

  ipcMain.handle(
    'kot-history:list',
    async (_event, options = {}) => {
      try {
        return {
          success: true,
          data:
            kotHistoryRepo.getKotHistory(
              options
            ),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error?.message ||
            String(error),
        };
      }
    }
  );

  ipcMain.handle(
    'pos:getKotHistoryDetail',
    async (_event, kotHistoryId) => {
      try {
        return {
          success: true,
          data:
            kotHistoryRepo.getKotHistoryDetail(
              kotHistoryId
            ),
        };
      } catch (error) {
        console.error(
          'GET KOT HISTORY DETAIL FAILED',
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            'Failed to load KOT history detail',
        };
      }
    }
  );



  ipcMain.handle(
    'pos:getDeletedKotHistoryItems',
    async (_event, selectedDate) => {
      try {
        if (
          typeof selectedDate !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
        ) {
          throw new Error('Invalid date');
        }

        return {
          success: true,
          data: kotHistoryRepo.getDeletedKotHistoryItems(
            selectedDate
          ),
        };
      } catch (error) {
        console.error('GET DELETED KOT ITEMS FAILED', error);

        return {
          success: false,
          error:
            error?.message ||
            'Failed to load deleted KOT items',
        };
      }
    }
  );

  ipcMain.handle(
    'pos:getRecentKotHistoryItems',
    async (_event, limit = 20) => {
      try {
        return {
          success: true,
          data:
            kotHistoryRepo.getRecentKotHistoryItems(
              limit
            ),
        };
      } catch (error) {
        console.error(
          'GET RECENT KOT HISTORY ITEMS FAILED',
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            'Failed to load KOT history items',
        };
      }
    }
  );

  ipcMain.handle(
    'kotHistory:markTablePaid',
    async (_event, args) => {
      try {
        return kotHistoryRepo.markTableHistoryPaid(
          args
        );
      } catch (error) {
        console.error(
          'IPC KOT HISTORY PAID FAILED:',
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );

  ipcMain.handle(
    'kot-history:mark-paid',
    async (_e, kotHistoryId) => {
      try {
        if (!kotHistoryId) {
          throw new Error(
            'KOT history ID is required'
          );
        }

        return kotHistoryRepo.markKotHistoryPaid(
          kotHistoryId
        );
      } catch (error) {
        console.error(
          'MARK KOT HISTORY PAID FAILED:',
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );



  ipcMain.handle(
    'kot-history:detail',
    async (_event, kotHistoryId) => {
      try {
        return {
          success: true,
          data:
            kotHistoryRepo.getKotHistoryDetail(
              kotHistoryId
            ),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error?.message ||
            String(error),
        };
      }
    }
  );
  // =====================================================
  // ORDER NO
  // =====================================================

  ipcMain.handle('bill:getReservedOrderNo', async (_event, tableNo) => {
    try {
      if (!tableNo) {
        return { success: false, error: 'tableNo is required' };
      }

      const mapping = getExistingOrderNo(db, tableNo);

      return {
        success: true,
        srno: mapping?.srno || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get invoice number',
      };
    }
  });


  // =====================================================
  // RESERVE / GET PRINT ORDER NUMBER
  // =====================================================

  ipcMain.handle(
    'bill:getOrCreateOrderNo',
    async (_event, tableNo) => {
      try {
        if (
          tableNo === undefined ||
          tableNo === null ||
          String(tableNo).trim() === ''
        ) {
          return {
            success: false,
            error: 'tableNo is required',
          };
        }

        const mapping = getOrCreateOrderNo(
          db,
          String(tableNo),
          TERMINAL_CODE
        );

        return {
          success: true,
          srno: mapping.srno,
          orderSerialNo: mapping.orderSerialNo,
          mapKey: mapping.mapKey,
        };
      } catch (error) {
        console.error(
          '[BILL] Failed to reserve order number:',
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            'Failed to generate order number',
        };
      }
    }
  );

  // =====================================================
  // BILLING
  // =====================================================

  ipcMain.handle(
    'bill-items:insert',
    async (_e, items) => {
      try {
        const result =
          billItemRepo.insertBillItems(
            items
          );

        tableRepo.refreshAllTableBillVisualStates();
        notifyBillItemsChanged();
        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );




  ipcMain.handle(
    "pos-bill-item:move-to-table",
    async (
      _event,
      {
        itemId,
        tableNo,
        tableName,
        quantity,
      }
    ) => {
      try {
        const result =
          billItemRepo.moveBillItemToTable(
            itemId,
            tableNo,
            tableName,
            quantity
          );

        console.log(
          "[MOVE ITEM IPC] Move result:",
          result
        );

        if (result.success) {
          tableRepo.refreshAllTableCartVisualStates();
          tableRepo.refreshAllTableBillVisualStates();
          notifyBillItemsChanged();
        }

        return result;
      } catch (error) {
        console.error(
          "[MOVE ITEM IPC] moveBillItemToTable error:",
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to move item",
        };
      }
    }
  );


  ipcMain.handle(
    "pos-bill:move-full-table",
    async (
      _event,
      {
        sourceTableNo,
        sourceTableName,
        destinationTableNo,
        destinationTableName,
      }
    ) => {
      try {
        console.log("========================================");
        console.log(
          "[MOVE FULL TABLE IPC] START"
        );

        console.log(
          "[MOVE FULL TABLE IPC] Source:",
          sourceTableNo
        );

        console.log(
          "[MOVE FULL TABLE IPC] Destination:",
          destinationTableNo
        );

        const result =
          billItemRepo.moveFullTableToTable(
            sourceTableNo,
            sourceTableName,
            destinationTableNo,
            destinationTableName
          );

        console.log(
          "[MOVE FULL TABLE IPC] Result:",
          result
        );

        if (result.success) {

          console.log(
            "[MOVE FULL TABLE IPC] Refreshing table cart states..."
          );

          tableRepo.refreshAllTableCartVisualStates();
          notifyBillItemsChanged();
          console.log(
            "[MOVE FULL TABLE IPC] Refreshing table bill states..."
          );

          tableRepo.refreshAllTableBillVisualStates();

          console.log(
            "[MOVE FULL TABLE IPC] Table states refreshed"
          );
        }

        console.log(
          "[MOVE FULL TABLE IPC] COMPLETE"
        );

        console.log("========================================");

        return result;

      } catch (error) {

        console.error(
          "[MOVE FULL TABLE IPC] ERROR:",
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );

  ipcMain.handle(
    'bill:create',
    async (_event, input) => {
      try {

        //       broadcastLanEvent({
        //   type: "TEST",
        //   message: "OK"
        // });
        const result =
          await createBillFromKitchen(
            input
          );

        if (result?.success !== false) {
          tableRepo.refreshAllTableCartVisualStates();
          tableRepo.refreshAllTableBillVisualStates();
          notifyBillItemsChanged();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error?.message ||
            'Failed to create bill',
        };
      }
    }
  );



  ipcMain.handle(
    'bill:cancel',
    async (_event, input) => {
      try {

        //       broadcastLanEvent({
        //   type: "TEST",
        //   message: "OK"
        // });
        const result =
          await cancelBillFromKitchen(
            input
          );

        if (result?.success !== false) {
          tableRepo.refreshAllTableCartVisualStates();
          tableRepo.refreshAllTableBillVisualStates();
          notifyBillItemsChanged();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error?.message ||
            'Failed to create bill',
        };
      }
    }
  );

  ipcMain.handle(
    "bill:update-item-quantity",
    async (_event, args) => {
      try {
        const result =
          billRepo.updateBillItemQuantity(
            args
          );

        if (result?.success !== false) {
          tableRepo.refreshAllTableBillVisualStates();
          notifyBillItemsChanged();
        }

        return result;

      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );

  ipcMain.handle(
    "bill:increase-item-quantity",
    async (_event, args) => {
      try {
        const result =
          billRepo.increaseBillItemQuantity(
            args
          );

        if (result?.success !== false) {
          tableRepo.refreshAllTableBillVisualStates();
          notifyBillItemsChanged();
        }

        return result;

      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );

  ipcMain.handle(
    "pos:deleteBillItem",
    async (_event, data) => {
      try {
        const {
          tableNo,
          billItemGroupKey,
          reason,
          cancelKitchen,
        } = data;

        if (!tableNo) {
          return {
            success: false,
            error: "Table number is required",
          };
        }

        if (!billItemGroupKey) {
          return {
            success: false,
            error: "Bill item group key is required",
          };
        }

        if (!reason || !String(reason).trim()) {
          return {
            success: false,
            error: "Delete reason is required",
          };
        }

        const result = billRepo.deleteBillItem({
          tableNo,
          billItemGroupKey,
          reason: String(reason).trim(),
          cancelKitchen: Boolean(cancelKitchen),
        });
        notifyBillItemsChanged();
        return result;
      } catch (error) {
        console.error(
          "IPC pos:deleteBillItem failed:",
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );

  ipcMain.handle(
    'bill:delete-item',
    async (_event, args) => {
      try {
        const result =
          await billRepo.deleteBillItem(
            args
          );

        if (result?.success !== false) {
          tableRepo.refreshAllTableBillVisualStates();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        };
      }
    }
  );




  ipcMain.handle(
    'bill-items:list',
    async (_e, tableNo) => {
      return billItemRepo.getOpenBillItems(
        tableNo
      );
    }
  );


  ipcMain.handle(
    'bill-items:count',
    async (_e, tableNo) => {
      return billItemRepo.countOpenBillItems(tableNo);
    }
  );



  ipcMain.handle(
    'bill-items:mark-billed',
    async (
      _e,
      tableNo,
      billId,
      billNo
    ) => {
      const result =
        billItemRepo.markBillItemsBilled(
          tableNo,
          billId,
          billNo
        );

      if (result?.success !== false) {
        tableRepo.refreshAllTableBillVisualStates();
        notifyBillItemsChanged();
      }

      return result;
    }
  );

  ipcMain.handle(
    'clear-kot-by-table',
    async (_event, tableNo) => {
      await db
        .prepare(
          'DELETE FROM pos_kot_items WHERE tableNo = ?'
        )
        .run(tableNo);

      return {
        success: true,
      };
    }
  );

  ipcMain.handle(
    'bill:get-kot-items',
    async (_event, tableNo) => {
      return getBillableKotItems(
        tableNo
      );
    }
  );


  // =====================================================
  // CART
  // =====================================================

  ipcMain.handle(
    'cart:list',
    async (_e, tableNo) => {
      return cartRepo.getCartItems(
        tableNo
      );
    }
  );

  // ipcMain.handle(
  //   'cart:add',
  //   async (_e, item, tableNo) => {
  //     const result =
  //       await cartRepo.addCartItem(
  //         item,
  //         tableNo
  //       );

  //     tableRepo.refreshAllTableCartVisualStates();

  //     return result;
  //   }
  // );

ipcMain.handle(
  'cart:add',
  async (_e, item, tableNo) => {
    console.log('\n========== CART ADD: BEFORE SQLITE SAVE ==========');
    console.log({
      productId: item?.productId,
      name: item?.name,
      kitchenPrintReq: item?.kitchenPrintReq,
      type: typeof item?.kitchenPrintReq,
      tableNo,
    });

    const result =
      await cartRepo.addCartItem(
        item,
        tableNo
      );

    console.log('\n========== CART ADD: AFTER SQLITE SAVE ==========');
    console.log('Repository result:', result);

    tableRepo.refreshAllTableCartVisualStates();

    return result;
  }
);





  ipcMain.handle(
    'cart:remove',
    async (
      _e,
      uniqueKey,
      tableNo,
      removeAll
    ) => {
      const result =
        cartRepo.removeCartItem(
          uniqueKey,
          tableNo,
          removeAll
        );

      if (result?.success !== false) {
        tableRepo.refreshAllTableCartVisualStates();
      }

      return result;
    }
  );

  ipcMain.handle(
    'cart:clear',
    async (_e, tableNo) => {
      const result =
        cartRepo.clearCart(
          tableNo
        );

      if (result?.success !== false) {
        tableRepo.refreshAllTableCartVisualStates();
      }

      return result;
    }
  );

  ipcMain.handle(
    'cart:update-note',
    async (
      _e,
      itemId,
      note,
      tableNo
    ) => {
      const result =
        cartRepo.updateCartItemNote(
          itemId,
          note,
          tableNo
        );

      if (result?.success !== false) {
        tableRepo.refreshAllTableCartVisualStates();
      }

      return result;
    }
  );


  ipcMain.handle(
    'cart:updateKitchenPrint',
    async (_event, { itemId, kitchenPrintReq, partition }) => {
      try {
        const items = await cartRepo.updateCartItemKitchenPrint(
          itemId,
          kitchenPrintReq,
          partition
        );

        return {
          success: true,
          data: items,
        };
      } catch (error) {
        console.error(
          '[CART] Failed to update kitchen print:',
          error
        );

        return {
          success: false,
          error: error.message || 'Failed to update kitchen print',
        };
      }
    }
  );


  // =====================================================
  // SYNC
  // =====================================================

  ipcMain.handle(
    'sync:all',
    async () => {
      return syncAll();
    }
  );


  // =====================================================
  // CATEGORIES
  // =====================================================

  ipcMain.handle(
    'categories:list',
    async () => {
      return getAllCategories();
    }
  );


  // =====================================================
  // PRODUCTS
  // =====================================================

  ipcMain.handle(
    'products:list',
    async () => {
      return getAllProducts();
    }
  );

  ipcMain.handle(
    'products:by-category',
    async (_e, categoryId) => {
      return getProductsByCategory(
        categoryId
      );
    }
  );

  ipcMain.handle(
    'products:search',
    async (_e, query, foodType) => {
      return searchProducts(
        query,
        foodType
      );
    }
  );

  ipcMain.handle(
    'products:search-code',
    async (_e, code, foodType) => {
      return searchExactCode(
        code,
        foodType
      );
    }
  );


  // =====================================================
  // MODIFIERS
  // =====================================================

  ipcMain.handle(
    'modifier-groups:list',
    async () => {
      return getModifierGroups();
    }
  );

  ipcMain.handle(
    'product-modifiers:list',
    async () => {
      return getProductModifiers();
    }
  );


  // =====================================================
  // ORDERS
  // =====================================================

  ipcMain.handle(
    'orders:list',
    async (_e, date) => {
      return orderRepo.getOrders(date);
    }
  );

  ipcMain.handle(
    'orders:bussiness',
    async (_e, date) => {
      return orderRepo.getOrdersByBusinessDate(
        date
      );
    }
  );

  ipcMain.handle(
    'orders:realDate',
    async (_e, date) => {
      return orderRepo.getOrdersByRealDate(
        date
      );
    }
  );

  ipcMain.handle(
    'orders:get',
    async (_e, orderId) => {
      return orderRepo.getOrderById(
        orderId
      );
    }
  );

  ipcMain.handle(
    'orders:items',
    async (_e, orderId) => {
      return orderRepo.getOrderItems(
        orderId
      );
    }
  );


  ipcMain.handle(
    'orders:DeletedItems',
    async (_e, orderId) => {
      return orderRepo.getOrderDeletedItems(
        orderId
      );
    }
  );

  // =====================================================
  // ORDER SYNC IPC
  // =====================================================

  ipcMain.handle(
    'orders:upload',
    async () => {

      try {

        const result =
          await syncPendingOrders();

        console.log(
          '[IPC] ORDER UPLOAD RESULT',
          result
        );

        return result;

      } catch (error) {

        console.error(
          '[IPC] ORDER UPLOAD FAILED',
          error
        );

        throw error;

      }

    }
  );


  // =====================================================
  // BUSINESS DAY
  // =====================================================

  ipcMain.handle(
    'businessDay:getCurrent',
    async () => {
      try {
        return {
          success: true,
          data:
            businessDayRepo.getCurrentBusinessDay(),
        };
      } catch (e) {
        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );

  ipcMain.handle(
    'dayClosing:getBusinessInfoByDate',
    async (
      _event,
      businessDate
    ) => {
      try {
        return {
          success: true,
          data:
            dayClosingRepo.getBusinessInfoByDate(
              businessDate
            ),
        };
      } catch (e) {
        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );


  // =====================================================
  // DAY CLOSING HISTORY
  // =====================================================

  ipcMain.handle(
    'dayClosing:getHistory',
    async () => {
      try {
        const history =
          dayClosingRepo.getHistory();

        return {
          success: true,
          data: history,
        };
      } catch (e) {
        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );

  // =====================================================
  // CLOSE BUSINESS DAY
  // =====================================================

  ipcMain.handle(
    'dayClosing:close',
    async (
      _event,
      data
    ) => {

      try {

        console.log(
          '===================================='
        );

        console.log(
          'DAY CLOSING REQUEST'
        );

        console.log(
          'DATA:',
          data
        );

        console.log(
          '===================================='
        );


        const result =
          dayClosingRepo
            .closeBusinessDay({

              actualCash:
                Number(
                  data?.actualCash || 0
                ),

              cashHandedOver:
                Number(
                  data?.cashHandedOver || 0
                ),

              notes:
                data?.notes || '',

              closedById:
                data?.closedById || '',

              closedByName:
                data?.closedByName || '',

            });


        console.log(
          'DAY CLOSED SUCCESSFULLY:',
          result
        );


        return {
          success: true,
          data: result,
        };

      } catch (e) {

        console.error(
          'DAY CLOSING FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };

      }

    }
  );
  // =====================================================
  // CASH TRANSACTIONS
  // =====================================================

  // addCashTransaction: (
  //   data
  // ) =>
  //   ipcRenderer.invoke(
  //     'cashTransaction:add',
  //     data
  //   ),



  // =====================================================
  // ADD CASH TRANSACTION
  // =====================================================

  ipcMain.handle(
    'cashTransaction:add',
    async (
      _event,
      data
    ) => {

      try {

        console.log(
          '===================================='
        );

        console.log(
          'CASH TRANSACTION REQUEST'
        );

        console.log(
          'DATA:',
          data
        );

        console.log(
          '===================================='
        );

        const result =
          dayClosingRepo.addCashTransaction({
            type:
              data?.type || '',

            amount:
              Number(
                data?.amount || 0
              ),

            reason:
              data?.reason || '',

            notes:
              data?.notes || '',

            createdById:
              data?.createdById || '',

            createdByName:
              data?.createdByName || '',
          });

        console.log(
          'CASH TRANSACTION ADDED:',
          result
        );

        return {
          success: true,
          data: result,
        };

      } catch (e) {

        console.error(
          'CASH TRANSACTION FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );

  // =====================================================
  // SALE REPORT
  // =====================================================

  ipcMain.handle(
    'saleReport:getReport',
    async (_event, businessDate) => {

      // console.log(
      //   'REPORT IPC RECEIVED:',
      //   businessDate
      // );

      try {

        if (!businessDate) {
          return {
            success: false,
            error: 'Business date is required',
          };
        }

        // console.log(
        //   'CALLING REPORT REPOSITORY:',
        //   businessDate
        // );

        const report =
          saleReportRepo.getSalesReport(
            businessDate
          );

        // console.log(
        //   'REPORT FROM REPOSITORY:',
        //   report
        // );

        return {
          success: true,
          data: report,
        };

      } catch (e) {

        console.error(
          'REPORT IPC ERROR:',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );


  // =====================================================
  // UPLOAD DATA
  // =====================================================



  ipcMain.handle(
    'orderCounter:upload',
    async () => {
      try {
        const result =
          await uploadOrderCounter();

        return {
          success: true,
          ...result,
        };
      } catch (e) {
        console.error(
          'ORDER COUNTER UPLOAD FAILED',
          e
        );

        return {
          success: false,
          error:
            e?.message ||
            String(e),
        };
      }
    }
  );

  // =====================================================
  // USER 
  // =====================================================
  ipcMain.handle("users:getAll", async () => {
    try {
      return userRepository.getAllUsers();
    } catch (error) {
      console.error("Failed to get users:", error);

      return [];
    }
  });

  // =====================================================
  // POS LOGIN USERS
  // =====================================================

  ipcMain.handle("users:getPosLoginUsers", async () => {
    try {
      const users = userRepository.getPosLoginUsers();

      return {
        success: true,
        users,
      };
    } catch (error) {
      console.error(
        "Failed to get POS login users:",
        error
      );

      return {
        success: false,
        users: [],
        error:
          error.message ||
          "Failed to load POS users.",
      };
    }
  });



  // =====================================================
  // POS USER LOGIN
  // =====================================================

  ipcMain.handle(
    "users:login",
    async (_event, { userId, pin }) => {

      try {

        // ===============================================
        // VERIFY USER
        // ===============================================

        const result =
          authRepository.loginUser(
            userId,
            pin
          );


        // ===============================================
        // LOGIN FAILED
        // ===============================================

        if (!result?.success) {
          return result;
        }


        // ===============================================
        // CREATE POS SESSION
        // ===============================================

        // const session =
        //   posSessionRepository.createSession(
        //     result.user
        //   );


        // ===============================================
        // RETURN USER + SESSION
        // ===============================================

        const session =
          posSessionRepository.createSession(
            result.user
          );

        return {
          success: true,

          user: result.user,

          session,
        };

      } catch (error) {

        console.error(
          "POS user login failed:",
          error
        );

        return {
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Login failed.",
        };
      }
    }
  );



  // =====================================================
  // POS USER LOGOUT
  // =====================================================

  // ipcMain.handle(
  //   "users:logout",
  //   async () => {
  //     try {

  //       // No persistent POS session yet.
  //       // Session cleanup will be added later.

  //       return {
  //         success: true,
  //       };

  //     } catch (error) {

  //       console.error(
  //         "POS user logout failed:",
  //         error
  //       );

  //       return {
  //         success: false,
  //         error:
  //           error instanceof Error
  //             ? error.message
  //             : "Logout failed.",
  //       };
  //     }
  //   }
  // );

  // =====================================================
  // POS USER LOGOUT
  // =====================================================

  ipcMain.handle(
    "users:logout",
    async (_event, sessionId) => {

      try {

        if (sessionId) {

          posSessionRepository.closeSession(
            sessionId
          );

        } else {

          posSessionRepository.closeActiveSession();

        }


        return {
          success: true,
        };

      } catch (error) {

        console.error(
          "POS user logout failed:",
          error
        );

        return {
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Logout failed.",
        };
      }
    }
  );



  ipcMain.handle(
    "firebase:initialize",
    async (_event, clientId) => {
      try {
        const config =
          await fetchClientWebApi(clientId);

        saveFirebaseConfig(
          config,
          clientId
        );

        console.log(
          "FIREBASE CONFIG SAVED FOR:",
          clientId
        );

        return {
          success: true,
          data: config,
        };

      } catch (error) {
        console.error(
          "FIREBASE INITIALIZATION FAILED:",
          error
        );

        return {
          success: false,
          error: error.message ||
            "Failed to initialize Firebase",
        };
      }
    }
  );


  // ipcMain.handle(
  //   "firebase:get-config",
  //   async () => {
  //     try {
  //       const config = getFirebaseConfig();

  //       return {
  //         success: true,
  //         data: config || null,
  //       };
  //     } catch (error) {
  //       return {
  //         success: false,
  //         error: error.message,
  //       };
  //     }
  //   }
  // );


  ipcMain.handle("firebase:get-config", async () => {
    try {
      const config = getFirebaseConfig();

      const configured = Boolean(
        config?.apiKey &&
        config?.projectId &&
        config?.appId
      );

      return {
        success: true,
        configured,
        data: configured ? config : null,
      };
    } catch (error) {
      console.error(
        "FIREBASE CONFIG READ FAILED:",
        error
      );

      return {
        success: false,
        configured: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to read Firebase configuration",
      };
    }
  });



  app.on("before-quit", () => {
    stopWaiterWebSocketServer();
  });


}



// =====================================================
// NEXT.JS PRODUCTION SERVER
// =====================================================

let nextServer = null;


function startNextServer() {
  if (!app.isPackaged) {
    console.log(
      'Development mode: Next.js runs on localhost:3000'
    );
    return;
  }

  // =================================================
  // Next standalone is unpacked from app.asar
  // =================================================

  const standalonePath = path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    '.next',
    'standalone'
  );



  const serverPath = path.join(
    standalonePath,
    'server.js'
  );

  console.log(
    'NEXT SERVER:',
    serverPath
  );

  console.log(
    'NEXT SERVER EXISTS:',
    fs.existsSync(serverPath)
  );

  if (!fs.existsSync(serverPath)) {
    throw new Error(
      `Next.js server not found: ${serverPath}`
    );
  }

  // =================================================
  // Use the current Electron executable as Node
  // =================================================

  const nodePath = process.execPath;

  console.log(
    'NEXT NODE PATH:',
    nodePath
  );

  console.log(
    'NEXT NODE EXISTS:',
    fs.existsSync(nodePath)
  );

  console.log(
    'NEXT WORKING DIRECTORY:',
    standalonePath
  );

  console.log(
    'NEXT WORKING DIRECTORY EXISTS:',
    fs.existsSync(standalonePath)
  );

  console.log(
    'STARTING NEXT SERVER'
  );

  nextServer = spawn(
    nodePath,
    [serverPath],
    {
      cwd: standalonePath,

      env: {
        ...process.env,

        ELECTRON_RUN_AS_NODE: '1',

        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
      },

      stdio: 'inherit',
      windowsHide: true,
    }
  );

  nextServer.on('error', (error) => {
    console.error(
      'NEXT SERVER SPAWN FAILED:',
      error
    );
  });

  nextServer.on('exit', (code, signal) => {
    console.log(
      'NEXT SERVER EXITED:',
      {
        code,
        signal,
      }
    );

    nextServer = null;
  });
}


function stopNextServer() {
  if (!nextServer) {
    return;
  }

  console.log(
    'Stopping Next.js production server...'
  );

  try {
    nextServer.kill();
  } catch (error) {
    console.error(
      'Failed to stop Next.js server:',
      error
    );
  }

  nextServer = null;
}
// =====================================================
// WINDOW
// =====================================================



function createWindow() {
  const preloadPath = path.resolve(
    __dirname,
    "preload.cjs"
  );

  console.log("PRELOAD =>", preloadPath);

  const isDev = !app.isPackaged;

  const targetUrl = isDev
    ? "http://localhost:3000"
    : "http://127.0.0.1:3000";

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,

    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.maximize();

  win.once("ready-to-show", () => {
    console.log("[WINDOW] Ready to show");
    win.show();
  });

  win.webContents.on("did-finish-load", () => {
    console.log("[WINDOW] Page loaded:", targetUrl);
  });

  win.webContents.on(
    "did-fail-load",
    (_, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error("[WINDOW] Load failed:", {
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame,
      });
    }
  );

  win.webContents.on("render-process-gone", (_, details) => {
    console.error("[WINDOW] Renderer exited:", details);
  });

  win.webContents.on("console-message", (_, details) => {
    if (details.level >= 2) {
      console.error(
        "[RENDERER ERROR]",
        details.message
      );
    }
  });

  win.loadURL(targetUrl).catch((error) => {
    console.error("[WINDOW] loadURL failed:", error);
  });

  return win;
}





// =====================================================
// WAIT HELPER
// =====================================================


async function waitForNextServer(
  url,
  timeoutMs = 30000
) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(2000),
      });

      // Any HTTP response proves that the server is reachable.
      // Even a 404 or 500 means the HTTP server responded.
      console.log(
        "[NEXT SERVER] Responded with status:",
        response.status
      );

      return;
    } catch (error) {
      lastError = error;

      await new Promise(resolve =>
        setTimeout(resolve, 500)
      );
    }
  }

  throw new Error(
    `Next.js server did not respond at ${url} within ${timeoutMs}ms. ` +
    `Last error: ${lastError?.message ?? "Unknown error"}`
  );
}

// =====================================================
// APP READY
// =====================================================

app.whenReady().then(async () => {




  // ===================================================
  // INITIALIZE DATABASE FIRST
  // ===================================================

  try {
    initDb();

    console.log("DATABASE INITIALIZED");

    // console.log(
    //   "DATABASE COUNTS:",
    //   getDebugCounts()
    // );

  } catch (error) {
    console.error(
      "DATABASE INITIALIZATION FAILED:",
      error
    );

    app.quit();
    return;
  }

  registerIpcHandlers();

  // ===================================================
  // START NEXT.JS IN PRODUCTION
  // ===================================================

if (app.isPackaged) {
  console.log("[STARTUP] Starting Next.js server...");

  try {
    startNextServer();

    await waitForNextServer(
      "http://127.0.0.1:3000",
      30000
    );

    console.log(
      "[STARTUP] Next.js server is ready"
    );
  } catch (error) {
    console.error(
      "[STARTUP] Next.js server startup failed:",
      error
    );

    app.quit();
    return;
  }
}


  // ===================================================
  // CREATE WINDOW
  // ===================================================

  const win = createWindow();


  // =============================================
  // WAITER LAN SERVER RECIEVE
  // =============================================

  createWaiterLanServer();


  // =============================================
  // WAITER LAN SERVER SEND UPDATES
  // =============================================
  startWaiterWebSocketServer();

  // ===================================================
  // UPLOAD LOCAL COUNTER EVERY 5 MINUTES
  // ===================================================

  setInterval(() => {
    uploadOrderCounter().catch(console.error);
  }, 5 * 60 * 1000);

  // ===================================================
  // DEVTOOLS SHORTCUTS
  // ===================================================

  if (!app.isPackaged) {
    globalShortcut.register(
      "F12",
      () => {
        win.webContents.toggleDevTools();
      }
    );

    globalShortcut.register(
      "CommandOrControl+Shift+I",
      () => {
        win.webContents.toggleDevTools();
      }
    );
  }

});





// =====================================================
// CLEANUP
// =====================================================

app.on(
  'window-all-closed',
  () => {
    if (
      process.platform !== 'darwin'
    ) {
      app.quit();
    }
  }
);

// app.on('before-quit', () => {
//   stopNextServer();
// });

// app.on('before-quit', async () => {
//   try {
//     await uploadOrderCounter();
//   } catch (e) {
//     console.error(
//       'Failed to upload order counter on quit',
//       e
//     );
//   }
// });

//   app.on('before-quit', () => {
//   stopWaiterLanServer();
// });

app.on('before-quit', async () => {
  try {
    await uploadOrderCounter();
  } catch (e) {
    console.error(
      'Failed to upload order counter on quit',
      e
    );
  }

  stopWaiterLanServer();
  stopNextServer();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
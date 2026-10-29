
const { WebSocketServer, WebSocket } = require("ws");

const {
  getAllBillItemsForWaiterSync,
} = require("../db/billItemRepo.cjs");

const PORT = 2346;
const SNAPSHOT_INTERVAL_MS = 10000;

let wss = null;
let snapshotTimer = null;

function broadcastSnapshot() {
  if (!wss) return;

  try {
    const items = getAllBillItemsForWaiterSync();

    const message = JSON.stringify({
      type: "BILL_ITEMS_SNAPSHOT",
      timestamp: Date.now(),
      items,
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }

    console.log(
      `[WAITER WS] Sent ${items.length} bill items`
    );
  } catch (error) {
    console.error(
      "[WAITER WS] Snapshot failed:",
      error
    );
  }
}

function startWaiterWebSocketServer() {
  if (wss) return;

  wss = new WebSocketServer({
    host: "0.0.0.0",
    port: PORT,
  });

  // wss.on("listening", () => {
  //   console.log(`[WAITER WS] Listening on ${PORT}`);

  //   // Send the latest snapshot immediately and every 5 seconds.
  //   broadcastSnapshot();

  //   snapshotTimer = setInterval(
  //     broadcastSnapshot,
  //     SNAPSHOT_INTERVAL_MS
  //   );
  // });

  wss.on("connection", (socket) => {
    console.log("[WAITER WS] Android connected");

    // Send current data immediately to a newly connected device.
    try {
      socket.send(JSON.stringify({
        type: "BILL_ITEMS_SNAPSHOT",
        timestamp: Date.now(),
        items: getAllBillItemsForWaiterSync(),
      }));
    } catch (error) {
      console.error(
        "[WAITER WS] Initial snapshot failed:",
        error
      );
    }
  });

  wss.on("error", (error) => {
    console.error("[WAITER WS] Server error:", error);
  });
}

function stopWaiterWebSocketServer() {
  if (snapshotTimer) {
    clearInterval(snapshotTimer);
    snapshotTimer = null;
  }

  if (wss) {
    wss.close();
    wss = null;
  }
}


function notifyBillItemsChanged() {
  broadcastSnapshot();
}


module.exports = {
  startWaiterWebSocketServer,
  stopWaiterWebSocketServer,
  notifyBillItemsChanged,
};





const dgram = require("dgram");

const UDP_PORT = 3456;

// Your LAN broadcast address
const BROADCAST_ADDRESS = "192.168.31.255";

/**
 * Send an event to ALL waiter devices on the LAN.
 *
 * @param {Object} event
 */
function broadcastLanEvent(event) {

    const socket =
        dgram.createSocket("udp4");

    const message =
        Buffer.from(
            JSON.stringify(event),
            "utf8"
        );

    socket.on("error", (error) => {

        console.error(
            "❌ LAN UDP broadcast error:",
            error
        );

        socket.close();
    });

    socket.bind(() => {

        try {

            socket.setBroadcast(true);

            socket.send(
                message,
                UDP_PORT,
                BROADCAST_ADDRESS,
                (error) => {

                    if (error) {

                        console.error(
                            "❌ LAN event send failed:",
                            error
                        );

                    } else {

                        console.log(
                            "📡 LAN EVENT BROADCAST SENT"
                        );

                        console.log(
                            "📡 Address:",
                            `${BROADCAST_ADDRESS}:${UDP_PORT}`
                        );

                        console.log(
                            "📡 Event:",
                            JSON.stringify(event)
                        );
                    }

                    socket.close();
                }
            );

        } catch (error) {

            console.error(
                "❌ LAN broadcast exception:",
                error
            );

            socket.close();
        }
    });
}

module.exports = {
    broadcastLanEvent
};
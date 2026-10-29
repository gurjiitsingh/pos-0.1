const net = require('net');

class LanPrinter {
  async printText(config, text) {
    return new Promise((resolve) => {
      const socket = new net.Socket();

      socket.setTimeout(3000);

      socket.connect(
        config.port || 9100,
        config.ip,
        () => {
          try {
            // ESC/POS INIT
            const init = Buffer.from([
              0x1B, 0x40,
            ]);

            // FULL CUT
            const cut = Buffer.from([
              0x1D, 0x56, 0x00,
            ]);

            socket.write(init);

            socket.write(
              Buffer.from(
                text.replace(/\n/g, '\r\n'),
                'utf8'
              )
            );

            socket.write(Buffer.from('\n\n\n'));

            socket.write(cut);

            socket.end();

            resolve(true);
          } catch (e) {
            console.error(
              'LAN print write failed',
              e
            );

            socket.destroy();

            resolve(false);
          }
        }
      );

      socket.on('error', (err) => {
        console.error('LAN printer error', err);
        resolve(false);
      });

      socket.on('timeout', () => {
        console.error('LAN printer timeout');

        socket.destroy();

        resolve(false);
      });
    });
  }

  async printImage(_config, _image) {
    throw new Error(
      'Image printing not implemented yet'
    );
  }
}

module.exports = {
  LanPrinter,
};
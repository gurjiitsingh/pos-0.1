const net = require('net');

class LanPrinter {
  async printText(config, text) {
    // =====================================================
    // TEST MODE — DO NOT CONNECT TO A PHYSICAL PRINTER
    // =====================================================
    const TEST_MODE = true;

    if (TEST_MODE) {
      // console.log('========== LAN PRINTER TEST MODE ==========');
      // console.log('Printer connection skipped.');
      // console.log('Printer IP:', config?.ip || 'Not configured');
      // console.log('Printer port:', config?.port || 9100);
      // console.log('========== PRINT CONTENT ==========');
      // console.log(text);
      // console.log('========== END PRINT CONTENT ==========');

      // Simulate successful printing.
      return true;
    }

    // =====================================================
    // REAL LAN PRINTER
    // =====================================================
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(3000);

      socket.connect(
        config.port || 9100,
        config.ip,
        () => {
          try {
            const init = Buffer.from([0x1B, 0x40]);
            const cut = Buffer.from([0x1D, 0x56, 0x00]);

            const content = Buffer.from(
              text.replace(/\n/g, '\r\n'),
              'utf8'
            );

            socket.write(
              Buffer.concat([
                init,
                content,
                Buffer.from('\n\n\n'),
                cut,
              ]),
              (err) => {
                if (err) {
                  console.error('LAN print write failed', err);
                  finish(false);
                  return;
                }

                socket.end();
                finish(true);
              }
            );
          } catch (e) {
            console.error('LAN print write failed', e);
            finish(false);
          }
        }
      );

      socket.on('error', (err) => {
        console.error('LAN printer error', err);
        finish(false);
      });

      socket.on('timeout', () => {
        console.error('LAN printer timeout');
        finish(false);
      });
    });
  }

  async printImage(_config, _image) {
    throw new Error('Image printing not implemented yet');
  }
}

class LanPrinter1 {
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
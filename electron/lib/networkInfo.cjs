const os = require('os');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const addresses = interfaces[name] || [];

    for (const address of addresses) {
      if (
        address.family === 'IPv4' &&
        !address.internal
      ) {
        return address.address;
      }
    }
  }

  return null;
}

function getNetworkInfo() {
  return {
    ipAddress: getLocalIpAddress(),
    hostname: os.hostname(),
  };
}

module.exports = {
  getLocalIpAddress,
  getNetworkInfo,
};
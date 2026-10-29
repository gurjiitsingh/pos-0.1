const db = require('./sqlite.cjs');

require('./schema/orderMaster.cjs')(db);
require('./schema/orderItems.cjs')(db);
require('./schema/billItems.cjs')(db);
require('./schema/kotItems.cjs')(db);

console.log('Database schema initialized');

module.exports = db;
const db = require('./init.cjs');

function getDebugCounts() {
  return {
    categories: db.prepare('SELECT COUNT(*) as c FROM categories').get().c,
    products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
    cart: db.prepare('SELECT COUNT(*) as c FROM pos_cart_item').get().c,
  };
}

module.exports = { getDebugCounts };
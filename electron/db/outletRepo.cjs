const { db } = require('./sqlite.cjs');

function clearOutlet() {
  db.prepare('DELETE FROM outlet').run();
}

function saveOutlet(outlet) {
  db.prepare(`
    INSERT INTO outlet (
      outletId,
      outletName,
      ownerId,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      state,
      zipcode,
      countryName,
      taxType,
      taxMode,
      gstVatNumber,
      fssaiNumber,
      phone,
      phone2,
      email,
      web,
      logoUrl,
      printerWidth,
      printerIPBill,
      printerIPKitchen,
      printerName,
      footerNote,
      qrEnabled,
      qrText,
      qrTitle,
      upiId,
      upiName,
      upiTitle,
      countryCode,
      currencyCode,
      localeTag,
      isActive,
      posType,
      showCategorySidebar,
      startupScreen
    ) VALUES (
      @outletId,
      @outletName,
      @ownerId,
      @addressLine1,
      @addressLine2,
      @addressLine3,
      @city,
      @state,
      @zipcode,
      @countryName,
      @taxType,
      @taxMode,
      @gstVatNumber,
      @fssaiNumber,
      @phone,
      @phone2,
      @email,
      @web,
      @logoUrl,
      @printerWidth,
      @printerIPBill,
      @printerIPKitchen,
      @printerName,
      @footerNote,
      @qrEnabled,
      @qrText,
      @qrTitle,
      @upiId,
      @upiName,
      @upiTitle,
      @countryCode,
      @currencyCode,
      @localeTag,
      @isActive,
      @posType,
      @showCategorySidebar,
      @startupScreen
    )
  `).run({
    ...outlet,
    qrEnabled: outlet.qrEnabled ? 1 : 0,
    isActive: outlet.isActive ? 1 : 0,
    showCategorySidebar: outlet.showCategorySidebar ? 1 : 0,
  });
}

function getOutlet() {
  return db.prepare('SELECT * FROM outlet LIMIT 1').get();
}

module.exports = {
  clearOutlet,
  saveOutlet,
  getOutlet,
};
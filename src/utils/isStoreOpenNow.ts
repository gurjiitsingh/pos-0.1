function isStoreOpenNow(openTime: string, closeTime: string) {
  const now = new Date();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  const open = new Date();
  open.setHours(openH, openM, 0, 0);

  const close = new Date();
  close.setHours(closeH, closeM, 0, 0);

  return now >= open && now <= close;
}



// ⛔ BLOCK order if store is closed & no schedule selected

// const storeIsOpen = isStoreOpenNow(settings.openTime, settings.closeTime);

// if (!storeIsOpen && !scheduledAt) {
//   toast.error("Store is currently closed. Please schedule your order.");
//   return;
// }
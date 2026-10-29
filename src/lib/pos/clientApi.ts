export const posApi = {

  addCartItem: (
    item: any,
    tableNo: string
  ) =>
    window.posApi.addCartItem(
      item,
      tableNo
    ),

  getCartItems: (
    tableNo?: string
  ) =>
    window.posApi.getCartItems(
      tableNo ?? 'T1'
    ),

  removeCartItem: (
    uniqueKey: string,
    tableNo: string,
    removeAll = false
  ) =>
    window.posApi.removeCartItem(
      uniqueKey,
      tableNo,
      removeAll
    ),

  clearCart: (
    tableNo?: string
  ) =>
    window.posApi.clearCart(
      tableNo ?? 'T1'
    ),

  // =====================================================
  // UPDATE CART ITEM NOTE
  // =====================================================

  updateCartItemNote: (
    itemId: number,
    note: string,
    tableNo: string
  ) =>
    window.posApi.updateCartItemNote(
      itemId,
      note,
      tableNo
    ),

  syncAll: () =>
    window.posApi.syncAll(),

};
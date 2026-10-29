'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
const [orders, setOrders] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadOrders();
}, []);

async function loadOrders() {
try {
setLoading(true);
 
  const rows = await window.posApi.getOrders();

  setOrders(rows);
} catch (e) {
  console.error('Failed to load orders', e);
} finally {
  setLoading(false);
}
 

}

return ( <div className="p-4"> <div className="mb-4 flex items-center justify-between"> <h1 className="text-xl font-semibold">Orders</h1>

 
    <button
      onClick={loadOrders}
      className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
    >
      Refresh
    </button>
  </div>

  {loading ? (
    <p className="text-sm text-gray-500">Loading orders...</p>
  ) : orders.length === 0 ? (
    <p className="text-sm text-gray-500">No orders found</p>
  ) : (
    <div className="overflow-hidden rounded border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="border-b px-3 py-2">Bill No</th>
            <th className="border-b px-3 py-2">Table</th>
            <th className="border-b px-3 py-2">Customer</th>
            <th className="border-b px-3 py-2">Type</th>
            <th className="border-b px-3 py-2 text-right">Total</th>
            <th className="border-b px-3 py-2">Payment</th>
            <th className="border-b px-3 py-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td className="px-3 py-2 font-medium">
                {order.srno}
              </td>

              <td className="px-3 py-2">
                {order.tableNo || '-'}
              </td>

              <td className="px-3 py-2">
                {order.customerName || 'Customer'}
              </td>

              <td className="px-3 py-2">
                {order.orderType}
              </td>

              <td className="px-3 py-2 text-right font-semibold">
                ₹{Number(order.grandTotal || 0).toFixed(2)}
              </td>

              <td className="px-3 py-2">
                {order.paymentMode}
              </td>

              <td className="px-3 py-2">
                {order.paymentStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
 

);
}

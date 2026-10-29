'use client';
import { useToast } from '@/hooks/useToast';

 

export default function TestPrinter() {
  const { showToast, toastComponent } = useToast();
  async function handlePrint() {
    const result = await window.posApi.print({
      role: 'KITCHEN',
      source: 'POS',
      data: {
        kotNumber: 'KOT-0001',
        tableNo: 'T1',
        tableName: 'TABLE-1',
        orderType: 'DINE_IN',
        createdAt: Date.now(),
        items: [
          { name: 'Paneer Tikka', quantity: 2 },
          { name: 'Masala Dosa', quantity: 1, note: 'Less oil' },
        ],
      },
    });

    console.log(result);
    showToast(JSON.stringify(result));
  }

  return (
    <>
    <button onClick={handlePrint}>
      Test Kitchen Print
    </button>
      {toastComponent}
  </>
  );
}
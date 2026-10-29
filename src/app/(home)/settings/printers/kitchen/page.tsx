
'use client';

import { useState } from 'react';

import LANPrinter from './LANPrinter';
import USBPrinter from './USBPrinter';
import BluetoothPrinter from './BluetoothPrinter';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
type PrinterType = 'LAN' | 'USB' | 'BLUETOOTH';

export default function BillPrinterPage() {
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterType>('LAN');
const { theme, background } = usePosTheme();
  return (
    <div  className={`h-[calc(100vh-64px)]  overflow-y-auto app-scrollbar ${background.className} ${background.text}`}>
      {/* Navigation buttons */}
  
<div className="mx-auto mt-4 mb-6 flex max-w-3xl items-center gap-3">
  <Link
    href="/settings/printers"
    className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Printer Settings
  </Link>

  <button
    onClick={() => setSelectedPrinter('LAN')}
    className="rounded-lg border px-3 py-1"
  >
    LAN
  </button>

  <button
    onClick={() => setSelectedPrinter('USB')}
    className="rounded-lg border px-3 py-1"
  >
    USB
  </button>

  <button
    onClick={() => setSelectedPrinter('BLUETOOTH')}
    className="rounded-lg border px-3 py-1"
  >
    Bluetooth
  </button>
</div>
 
<div className='mx-auto max-w-2xl'>
      {/* Load only the selected component */}
      {selectedPrinter === 'LAN' && <LANPrinter />}

      {selectedPrinter === 'USB' && <USBPrinter />}

      {selectedPrinter === 'BLUETOOTH' && ( <BluetoothPrinter />)}
      </div>
    </div>
  );
}

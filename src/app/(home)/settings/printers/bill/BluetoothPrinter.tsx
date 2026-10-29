'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useToast } from '@/hooks/useToast';
import {
  Printer,
  Save,
  TestTube,
  ArrowLeft,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

export default function BluetoothPrinter() {
  const { theme, background } = usePosTheme();

  const role = 'BILL';
  const title = 'Bill Printer - Bluetooth';

  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState('BILL Printer');
  const [paperSize, setPaperSize] = useState('80mm');
  const [renderMode, setRenderMode] = useState('TEXT');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
const { showToast, toastComponent } = useToast();
  // LOAD BLUETOOTH SETTINGS

  useEffect(() => {
    let mounted = true;

    async function loadPrinter() {
      try {
        const data = await window.posApi.getPrinterSettings();

        if (!mounted) return;

        const config = data?.find(
          (item: any) =>
            item.role === role &&
            item.connectionType === 'BLUETOOTH'
        );

        if (config) {
          setEnabled(config.enabled ?? true);
          setName(config.name || 'BILL Printer');
          setPaperSize(config.paperSize || '80mm');
          setRenderMode(config.renderMode || 'TEXT');
        }
      } catch (error) {
        console.error('Failed to load Bluetooth printer:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPrinter();

    return () => {
      mounted = false;
    };
  }, []);

  // SAVE BLUETOOTH SETTINGS

  async function save() {
    if (saving) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const result = await window.posApi.savePrinterSetting({
        role,
        active: enabled,
        name,
        connectionType: 'BLUETOOTH',
        paperSize,
        renderMode,
        ip: '',
        port: 9100,
      });

      if (result?.success) {
        setSaveMessage(`${title} saved successfully`);
      } else {
        setSaveMessage(
          result?.error || 'Failed to save Bluetooth printer'
        );
      }
    } catch (error) {
      console.error('SAVE BLUETOOTH PRINTER ERROR:', error);
      setSaveMessage('Failed to save Bluetooth printer');
    } finally {
      setSaving(false);
    }
  }

  // TEST BLUETOOTH PRINT

 async function testPrint() {
  try {
    const result = await window.posApi.print({
      role,
      source: 'SYSTEM',
      data: {
        kotNumber: 'TEST',
        tableNo: 'T1',
        tableName: 'TEST TABLE',
        orderType: 'TEST',
        createdAt: Date.now(),
        items: [
          {
            name: 'BLUETOOTH TEST ITEM',
            quantity: 1,
          },
        ],
      },
    });

    console.log('BLUETOOTH TEST PRINT RESULT:', result);

    showToast(JSON.stringify(result), 'success');
  } catch (error) {
    console.error('BLUETOOTH TEST PRINT ERROR:', error);

    showToast('Bluetooth test print failed', 'error');
  }
}

  if (loading) {
    return (
      <div
        className={`
          h-[calc(100vh-64px)]
          ${background.className}
          ${background.text}
          p-6
        `}
      >
        Loading Bluetooth printer settings...
      </div>
    );
  }

  return (
    <>
    <div>
      <div className=" p-1 mb-20">
       

        <div className="mb-8 flex items-center gap-4">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: theme.primaryLight,
              color: theme.primaryText,
            }}
          >
            <Printer className="h-8 w-8" />
          </div>

          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: theme.primaryText }}
            >
              {title}
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Configure your Bluetooth bill printer.
            </p>
          </div>
        </div>

        <div
          className={`
            space-y-6 rounded-xl border
            ${background.border} p-6
          `}
        >
          {/* ENABLE */}

          <div
            className={`
              flex items-center justify-between
              rounded-xl border ${background.border} p-4
            `}
          >
            <span className="font-medium">Enable Printer</span>

            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-5 w-5"
              style={{ accentColor: theme.primary }}
            />
          </div>

          {/* PRINTER NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Printer Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`
                w-full rounded-xl border ${background.border}
                px-3 py-3 outline-none
              `}
            />
          </div>

          {/* CONNECTION TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Connection Type
            </label>

            <div
              className="rounded-xl border px-3 py-3 font-medium"
              style={{
                borderColor: theme.primary,
                backgroundColor: theme.primaryLight,
                color: theme.primaryText,
              }}
            >
              BLUETOOTH
            </div>
          </div>

          {/* PAPER SIZE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Paper Size
            </label>

            <div className="grid grid-cols-2 gap-2">
              {['80mm', '58mm'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`
                    rounded-xl border ${background.border} px-3 py-3
                  `}
                  style={
                    paperSize === size
                      ? {
                          borderColor: theme.primary,
                          backgroundColor: theme.primaryLight,
                          color: theme.primaryText,
                        }
                      : undefined
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* RENDER MODE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Render Mode
            </label>

            <div className="grid grid-cols-2 gap-2">
              {['TEXT', 'IMAGE'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRenderMode(mode)}
                  className={`
                    rounded-xl border ${background.border} px-3 py-3
                  `}
                  style={
                    renderMode === mode
                      ? {
                          borderColor: theme.primary,
                          backgroundColor: theme.primaryLight,
                          color: theme.primaryText,
                        }
                      : undefined
                  }
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* SAVE AND TEST */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="
                flex flex-1 items-center justify-center gap-2
                rounded-xl px-4 py-3 font-medium text-white
                disabled:opacity-50
              "
              style={{ backgroundColor: theme.primary }}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={testPrint}
              className={`
                flex flex-1 items-center justify-center gap-2
                rounded-xl border ${background.border}
                px-4 py-3 font-medium
              `}
            >
              <TestTube className="h-4 w-4" />
              Test
            </button>
          </div>

          {saveMessage && (
            <p className="text-sm" role="status">
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    </div>
       {toastComponent}
  </>
  );
}
 
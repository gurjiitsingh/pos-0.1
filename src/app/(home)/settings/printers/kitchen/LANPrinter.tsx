
'use client';

import { useEffect, useState } from 'react';
import {
  Printer,
  Save,
  TestTube,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

export default function LANPrinter() {
  const { theme, background } = usePosTheme();

  const [active, setActive] = useState(false);
  const [name, setName] = useState('KITCHEN Printer');
  const [paperSize, setPaperSize] = useState('80mm');
  const [renderMode, setRenderMode] = useState('TEXT');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('9100');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [toastMessage, setToastMessage] = useState('');
const [toastType, setToastType] = useState<'success' | 'error'>('error');

function showToast(
  message: string,
  type: 'success' | 'error' = 'error'
) {
  setToastMessage(message);
  setToastType(type);
}

  // LOAD KITCHEN LAN PRINTER SETTINGS
  useEffect(() => {
    let mounted = true;

    async function loadPrinter() {
      try {
        const data = await window.posApi.getPrinterSettings();

        if (!mounted) return;

        const config = data?.find(
          (item: any) =>
            item.role === 'KITCHEN' &&
            item.connectionType === 'LAN'
        );

        if (config) {
          setActive(config.active === true);
          setName(config.name || 'KITCHEN Printer');
          setPaperSize(config.paperSize || '80mm');
          setRenderMode(config.renderMode || 'TEXT');
          setIp(config.ip || '');
          setPort(String(config.port || 9100));
        }
      } catch (error) {
        console.error(
          'Failed to load KITCHEN LAN printer:',
          error
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPrinter();

    return () => {
      mounted = false;
    };
  }, []);

  // TEST KITCHEN LAN PRINTER
 
async function testPrint() {
  try {
    const result = await window.posApi.print({
      role: 'KITCHEN',
      source: 'SYSTEM',
      data: {
        kotNumber: 'TEST',
        tableNo: 'T1',
        tableName: 'TEST TABLE',
        orderType: 'TEST',
        createdAt: Date.now(),
        items: [
          {
            name: 'KITCHEN TEST ITEM',
            quantity: 1,
          },
        ],
      },
    });

    console.log('KITCHEN LAN TEST PRINT RESULT:', result);

    if (!result?.success) {
      throw new Error(
        result?.error || 'KITCHEN test print failed'
      );
    }

    showToast(
      'KITCHEN test print job queued successfully.',
      'success'
    );
  } catch (error) {
    console.error('KITCHEN LAN TEST PRINT ERROR:', error);

    showToast(
      error instanceof Error
        ? error.message
        : 'KITCHEN LAN test print failed',
      'error'
    );
  }
}
 

  // SAVE KITCHEN LAN PRINTER SETTINGS
  async function save() {
    if (saving) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const config = {
        role: 'KITCHEN',
        active,
        name: name.trim() || 'KITCHEN Printer',
        connectionType: 'LAN',
        paperSize,
        renderMode,
        ip: ip.trim(),
        port: Number(port) || 9100,
      };

      console.log('SAVING KITCHEN LAN PRINTER:', config);

      const result =
        await window.posApi.savePrinterSetting(config);

      console.log('KITCHEN LAN SAVE RESULT:', result);

      if (result?.success) {
        setSaveMessage(
          'Kitchen LAN Printer saved successfully'
        );
      } else {
        setSaveMessage(
          result?.error || 'Failed to save Kitchen LAN printer'
        );
      }
    } catch (error) {
      console.error('SAVE KITCHEN LAN PRINTER ERROR:', error);
      setSaveMessage('Failed to save Kitchen LAN printer');
    } finally {
      setSaving(false);
    }
  }

  // SELECT OR DESELECT KITCHEN LAN CONNECTION
  async function handleActiveChange(checked: boolean) {
    try {
      const config = {
        role: 'KITCHEN',
        active: checked,
        name: name.trim() || 'KITCHEN Printer',
        connectionType: 'LAN',
        paperSize,
        renderMode,
        ip: ip.trim(),
        port: Number(port) || 9100,
      };

      const result =
        await window.posApi.savePrinterSetting(config);

      if (!result?.success) {
        throw new Error(
          result?.error ||
            'Failed to update KITCHEN LAN selection'
        );
      }

      setActive(checked);
      setSaveMessage(
        checked
          ? 'KITCHEN LAN selected as the active printer'
          : 'KITCHEN LAN deselected'
      );
    } catch (error) {
      console.error(
        '[KITCHEN LAN PRINTER] Failed to change active state:',
        error
      );

    showToast(
  error instanceof Error
    ? error.message
    : 'Failed to update KITCHEN LAN selection',
  'error'
);
    }
  }

  if (loading) {
    return (
      <div
        className={`h-[calc(100vh-64px)] ${background.className} ${background.text} p-6`}
      >
        Loading KITCHEN LAN printer settings...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-20 p-1">
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
              Kitchen Printer - LAN
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Configure the LAN kitchen printer.
            </p>
          </div>
        </div>

        <div
          className={`space-y-6 rounded-xl border ${background.border} p-6`}
        >
          {/* SELECT LAN CONNECTION */}
          <div
            className={`flex items-center justify-between rounded-xl border ${background.border} p-4`}
          >
            <div>
              <p className="font-medium">Use LAN Printer</p>

              <p className="mt-1 text-sm opacity-60">
                Select LAN as the active KITCHEN printer connection.
              </p>
            </div>

            <input
              type="checkbox"
              checked={active}
              onChange={(e) =>
                handleActiveChange(e.target.checked)
              }
              className="h-5 w-5"
              style={{ accentColor: theme.primary }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Printer Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border ${background.border} px-3 py-3 outline-none`}
            />
          </div>

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
                  className={`rounded-xl border ${background.border} px-3 py-3`}
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
                  className={`rounded-xl border ${background.border} px-3 py-3`}
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

          <div>
            <label className="mb-2 block text-sm font-medium">
              IP Address
            </label>

            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.100"
              autoComplete="off"
              className={`w-full rounded-xl border ${background.border} px-3 py-3 outline-none`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Port
            </label>

            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className={`w-full rounded-xl border ${background.border} px-3 py-3 outline-none`}
            />
          </div>

          {saveMessage && (
            <p className="text-sm" role="status">
              {saveMessage}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={testPrint}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border ${background.border} px-4 py-3 font-medium`}
            >
              <TestTube className="h-4 w-4" />
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

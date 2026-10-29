'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Printer,
  Save,
  TestTube,
  ArrowLeft,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { useToast } from '@/hooks/useToast';
type Props = {
  role: 'BILL' | 'KITCHEN' | 'BAR';
  title: string;
};

export default function PrinterConfigPage({
  role,
  title,
}: Props) {
  const { theme, background } = usePosTheme();

  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState(`${role} Printer`);
  const [connectionType, setConnectionType] = useState('LAN');
  const [paperSize, setPaperSize] = useState('80mm');
  const [renderMode, setRenderMode] = useState('TEXT');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('9100');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState('');
const { showToast, toastComponent } = useToast();
  // =====================================================
  // LOAD ONCE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadPrinter() {
      try {
        const data =
          await window.posApi.getPrinterSettings();

        if (!mounted) {
          return;
        }

        const config = data?.find(
          (item: any) =>
            item.role === role
        );

        if (!config) {
          setLoading(false);
          return;
        }

        setEnabled(
          config.enabled ?? true
        );

        setName(
          config.name ||
            `${role} Printer`
        );

        setConnectionType(
          config.connectionType ||
            'LAN'
        );

        setPaperSize(
          config.paperSize ||
            '80mm'
        );

        setRenderMode(
          config.renderMode ||
            'TEXT'
        );

        setIp(
          config.ip || ''
        );

        setPort(
          String(
            config.port || 9100
          )
        );
      } catch (error) {
        console.error(
          'Failed to load printer:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrinter();

    return () => {
      mounted = false;
    };
  }, [role]);

  // =====================================================
  // SAVE
  // =====================================================

async function save() {
  if (saving) {
    return;
  }

  setSaving(true);
  setSaveMessage('');

  try {
    const config = {
      role,
      active: enabled,
      name,
      connectionType,
      paperSize,
      renderMode,
      ip,
      port: Number(port) || 9100,
    };

    console.log('SAVING PRINTER:', config);

    const result =
      await window.posApi.savePrinterSetting(config);

    console.log('SAVE RESULT:', result);

    if (result?.success) {
      setSaveMessage(`${title} saved successfully`);
    }
    //  else {
    //   setSaveMessage(
    //     result?.error || 'Failed to save printer'
    //   );
   // }

  } catch (error) {
    console.error(
      'SAVE PRINTER ERROR:',
      error
    );

    setSaveMessage('Failed to save printer');

  } finally {
    setSaving(false);
  }
}

  // =====================================================
  // TEST
  // =====================================================

  async function testPrint() {
    try {
      const result =
        await window.posApi.print({
          role: role,
          source: 'SYSTEM',

          data: {
            kotNumber: 'TEST',
            tableNo: 'T1',
            tableName: 'TEST TABLE',
            orderType: 'TEST',
            createdAt: Date.now(),

            items: [
              {
                name:
                  `${role} TEST ITEM`,
                quantity: 1,
              },
            ],
          },
        });

      console.log(
        'TEST PRINT RESULT:',
        result
      );

     showToast(JSON.stringify(result), 'error');
    } catch (error) {
      console.error(
        'TEST PRINT ERROR:',
        error
      );

    showToast('Test print failed', 'error');
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

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
        Loading printer settings...
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
    <div
      className={`
        h-[calc(100vh-64px)]
        overflow-y-auto
        app-scrollbar
        ${background.className}
        ${background.text}
      `}
    >
      <div className="mx-auto max-w-2xl p-6">

        {/* BACK */}

        <Link
          href="/settings/printers"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            opacity-60
            hover:opacity-100
          "
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Printer Settings
        </Link>


        {/* HEADER */}

        <div className="mb-8 flex items-center gap-4">

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor:
                theme.primaryLight,
              color:
                theme.primaryText,
            }}
          >
            <Printer className="h-8 w-8" />
          </div>

          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                color:
                  theme.primaryText,
              }}
            >
              {title}
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Configure this printer.
            </p>
          </div>

        </div>


        {/* SETTINGS */}

        <div
          className={`
            space-y-6
            rounded-xl
            border
            ${background.border}
            p-6
          `}
        >

          {/* ENABLE */}

          <div
            className={`
              flex
              items-center
              justify-between
              rounded-xl
              border
              ${background.border}
              p-4
            `}
          >
            <span className="font-medium">
              Enable Printer
            </span>

            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) =>
                setEnabled(
                  e.target.checked
                )
              }
              className="h-5 w-5"
              style={{
                accentColor:
                  theme.primary,
              }}
            />
          </div>


          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Printer Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className={`
                w-full
                rounded-xl
                border
                ${background.border}
                px-3
                py-3
                outline-none
              `}
            />
          </div>


          {/* CONNECTION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Connection Type
            </label>

            <div className="grid grid-cols-3 gap-2">

              {[
                'LAN',
                'BLUETOOTH',
                'USB',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setConnectionType(
                      type
                    )
                  }
                  className={`
                    rounded-xl
                    border
                    ${background.border}
                    px-3
                    py-3
                    text-sm
                  `}
                  style={
                    connectionType === type
                      ? {
                          borderColor:
                            theme.primary,
                          backgroundColor:
                            theme.primaryLight,
                          color:
                            theme.primaryText,
                        }
                      : undefined
                  }
                >
                  {type}
                </button>
              ))}

            </div>
          </div>


          {/* PAPER */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Paper Size
            </label>

            <div className="grid grid-cols-2 gap-2">

              {[
                '80mm',
                '58mm',
              ].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setPaperSize(size)
                  }
                  className={`
                    rounded-xl
                    border
                    ${background.border}
                    px-3
                    py-3
                  `}
                  style={
                    paperSize === size
                      ? {
                          borderColor:
                            theme.primary,
                          backgroundColor:
                            theme.primaryLight,
                          color:
                            theme.primaryText,
                        }
                      : undefined
                  }
                >
                  {size}
                </button>
              ))}

            </div>
          </div>


          {/* RENDER */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Render Mode
            </label>

            <div className="grid grid-cols-2 gap-2">

              {[
                'TEXT',
                'IMAGE',
              ].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setRenderMode(mode)
                  }
                  className={`
                    rounded-xl
                    border
                    ${background.border}
                    px-3
                    py-3
                  `}
                  style={
                    renderMode === mode
                      ? {
                          borderColor:
                            theme.primary,
                          backgroundColor:
                            theme.primaryLight,
                          color:
                            theme.primaryText,
                        }
                      : undefined
                  }
                >
                  {mode}
                </button>
              ))}

            </div>
          </div>


          {/* IP */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              IP Address
            </label>

            <input
              type="text"
              value={ip}
              onChange={(e) =>
                setIp(e.target.value)
              }
              placeholder="192.168.1.100"
              autoComplete="off"
              className={`
                w-full
                rounded-xl
                border
                ${background.border}
                px-3
                py-3
                outline-none
              `}
            />
          </div>


          {/* PORT */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Port
            </label>

            <input
              type="number"
              value={port}
              onChange={(e) =>
                setPort(e.target.value)
              }
              className={`
                w-full
                rounded-xl
                border
                ${background.border}
                px-3
                py-3
                outline-none
              `}
            />
          </div>


          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-3
                font-medium
                text-white
                disabled:opacity-50
              "
              style={{
                backgroundColor:
                  theme.primary,
              }}
            >
              <Save className="h-4 w-4" />

              {saving
                ? 'Saving...'
                : 'Save'}
            </button>


            <button
              type="button"
              onClick={testPrint}
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                ${background.border}
                px-4
                py-3
                font-medium
              `}
            >
              <TestTube className="h-4 w-4" />

              Test
            </button>

          </div>

        </div>

      </div>
    </div>
       {toastComponent}
  </>
  );
}
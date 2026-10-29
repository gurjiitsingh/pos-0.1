
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

class UsbPrinter {
  async printText(config, text) {
    if (process.platform !== 'win32') {
      throw new Error(
        'USB printer transport currently supports Windows only'
      );
    }

const printerName = String(
  config.printerName || ''
).trim();

    if (!printerName) {
      throw new Error(
        'Windows USB printer name is not configured'
      );
    }

    // Preserve the ESC/POS workflow used by LanPrinter.
    const init = Buffer.from([0x1B, 0x40]);
    const body = Buffer.from(
      String(text).replace(/\n/g, '\r\n'),
      'utf8'
    );
    const feed = Buffer.from('\n\n\n');
    const cut = Buffer.from([0x1D, 0x56, 0x00]);

    const payload = Buffer.concat([
      init,
      body,
      feed,
      cut,
    ]).toString('base64');

    // Use Windows Winspool APIs to send RAW bytes
    // through the selected Windows printer queue.
    const printerNameBase64 = Buffer.from(
      printerName,
      'utf8'
    ).toString('base64');

    const powershell = `
$ErrorActionPreference = 'Stop'

$printerName = [Text.Encoding]::UTF8.GetString(
  [Convert]::FromBase64String('${printerNameBase64}')
)
$data = [Convert]::FromBase64String('${payload}')

$source = @'
using System;
using System.Runtime.InteropServices;

public class RawWindowsPrinter
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct DOC_INFO_1
    {
        public string pDocName;
        public string pOutputFile;
        public string pDataType;
    }

    [DllImport("winspool.drv", SetLastError = true,
        CharSet = CharSet.Unicode)]
    public static extern bool OpenPrinter(
        string pPrinterName,
        out IntPtr phPrinter,
        IntPtr pDefault
    );

    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", SetLastError = true,
        CharSet = CharSet.Unicode)]
    public static extern int StartDocPrinter(
        IntPtr hPrinter,
        int level,
        ref DOC_INFO_1 pDocInfo
    );

    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool WritePrinter(
        IntPtr hPrinter,
        byte[] pBytes,
        int dwCount,
        out int dwWritten
    );
}
'@

Add-Type -TypeDefinition $source

$printer = Get-CimInstance Win32_Printer |
  Where-Object { $_.Name -eq $printerName } |
  Select-Object -First 1

if (-not $printer) {
  throw "Windows printer queue not found: $printerName"
}

$handle = [IntPtr]::Zero

if (-not [RawWindowsPrinter]::OpenPrinter(
    $printerName, [ref]$handle, [IntPtr]::Zero
)) {
  throw "OpenPrinter failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
}

$docStarted = $false
$pageStarted = $false

try {
  $doc = New-Object RawWindowsPrinter+DOC_INFO_1
  $doc.pDocName = 'POS Receipt'
  $doc.pOutputFile = $null
  $doc.pDataType = 'RAW'

  if ([RawWindowsPrinter]::StartDocPrinter(
      $handle, 1, [ref]$doc
  ) -eq 0) {
    throw "StartDocPrinter failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
  }
  $docStarted = $true

  if (-not [RawWindowsPrinter]::StartPagePrinter($handle)) {
    throw "StartPagePrinter failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
  }
  $pageStarted = $true

  [int]$written = 0
  if (-not [RawWindowsPrinter]::WritePrinter(
      $handle, $data, $data.Length, [ref]$written
  )) {
    throw "WritePrinter failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
  }

  if ($written -ne $data.Length) {
    throw "Incomplete print data: $written of $($data.Length) bytes"
  }
}
finally {
  if ($pageStarted) {
    [void][RawWindowsPrinter]::EndPagePrinter($handle)
  }
  if ($docStarted) {
    [void][RawWindowsPrinter]::EndDocPrinter($handle)
  }
  [void][RawWindowsPrinter]::ClosePrinter($handle)
}
`;

    try {
      await execFileAsync(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-ExecutionPolicy',
          'Bypass',
          '-Command',
          powershell,
        ],
        {
          windowsHide: true,
          timeout: 20000,
          maxBuffer: 1024 * 1024,
        }
      );

      console.log(
        `[USB PRINTER] RAW job submitted to "${printerName}"`
      );

      return true;
    } catch (error) {
      console.error(
        '[USB PRINTER] Windows spooler error:',
        error.stderr || error.message
      );

     throw new Error(
  error.stderr || error.message || 'Windows USB printing failed'
);
    }
  }

  async printImage() {
    throw new Error(
      'USB image printing is not implemented'
    );
  }
}

module.exports = { UsbPrinter };

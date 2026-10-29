// lib/exportToCSV.ts
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  const replacer = (_key: string, value: any) =>
    value === null || value === undefined ? '' : value;

  const header = Object.keys(data[0]);

  const csv = [
    header.join(','), // CSV Header
    ...data.map((row) =>
      header.map((fieldName) => JSON.stringify(replacer(fieldName, row[fieldName]))).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export type CsvValue = string | number | boolean | null | undefined

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * RFC 4180 CSV with CRLF line endings. A UTF-8 byte-order mark is prepended so Excel
 * reads characters such as "×" and "–" correctly.
 */
export function toCsv(headers: readonly string[], rows: readonly (readonly CsvValue[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','))
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

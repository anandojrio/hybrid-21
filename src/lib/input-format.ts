/**
 * Formats typed digits as a Garmin-style time while the user types, so iOS can use the
 * numeric keypad: "3022" → "30:22", "13022" → "1:30:22". Max 6 digits (hh:mm:ss).
 */
export function formatTimeDigits(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, -2)}:${digits.slice(-2)}`
  return `${digits.slice(0, -4)}:${digits.slice(-4, -2)}:${digits.slice(-2)}`
}

/** Pace as m:ss from digits: "645" → "6:45", "1005" → "10:05". */
export function formatPaceDigits(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, -2)}:${digits.slice(-2)}`
}

/** Seconds → "h:mm:ss" or "mm:ss" for prefilling time fields. */
export function secondsToTimeInput(seconds: number | undefined): string {
  if (seconds === undefined) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export const numberToInput = (value: number | undefined) =>
  value === undefined ? '' : String(value)

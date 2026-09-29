/** Splits a number into a large integer part and a small fractional part, e.g. 21.1 → "21" + ".1". */
export function splitNumber(value: number, decimals: number): { whole: string; fraction: string } {
  const fixed = value.toFixed(decimals)
  const [whole, fraction] = fixed.split('.')
  return { whole: whole ?? fixed, fraction: fraction ? `.${fraction}` : '' }
}

// apps/web/src/lib/number.ts
export function sanitizeDecimal(
  input: string,
  maxDecimals: number,
  allowTrailingDot = true,
): string {
  if (input == null) return "";
  let s = String(input);

  // Normalize comma to dot
  s = s.replace(",", ".");

  // Keep only digits and dots
  s = s.replace(/[^0-9.]/g, "");

  if (s === "") return "";

  // If starts with dot, make it "0."
  if (s.startsWith(".")) s = "0" + s;

  // Keep only first dot
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    const left = s.slice(0, firstDot + 1);
    const right = s.slice(firstDot + 1).replace(/\./g, ""); // remove extra dots
    s = left + right;
  }

  // Optionally allow trailing dot during typing (e.g., "0.")
  const endsWithDot = s.endsWith(".");
  const parts = s.split(".");
  let int = parts[0] ?? "";
  let dec = parts[1] ?? "";

  // Trim leading zeros on integer part, but keep single "0"
  if (int.length > 1) int = int.replace(/^0+(?=\d)/, "");

  // Limit decimals
  if (dec && maxDecimals >= 0) dec = dec.slice(0, maxDecimals);

  if (endsWithDot && allowTrailingDot && dec.length === 0 && firstDot !== -1) {
    return `${int}.`;
  }
  return dec.length > 0 ? `${int}.${dec}` : int;
}

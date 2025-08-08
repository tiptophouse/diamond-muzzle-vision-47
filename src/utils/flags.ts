export function countryCodeToFlagEmoji(code?: string | null) {
  if (!code || code.length !== 2) return '🏳️';
  const cc = code.toUpperCase();
  const A = 0x1F1E6; // Regional Indicator Symbol Letter A
  const base = 'A'.charCodeAt(0);
  const first = A + (cc.charCodeAt(0) - base);
  const second = A + (cc.charCodeAt(1) - base);
  return String.fromCodePoint(first) + String.fromCodePoint(second);
}

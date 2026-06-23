// Voucher minting for the $5-tokens offer. Shared by the newsletter signup and
// the /tokens lead-magnet signup: both write voucher_code + voucher_expiry to a
// subscriber's Kit custom fields, and the welcome email's merge tags render them.

// Unredeemable-from-guessing, easy-to-read code. Excludes 0/O/1/I/L.
export function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BC-${code}`;
}

// Human-readable expiry N days out, in Sydney time, e.g. "15 June 2026".
export function voucherExpiry(days: number): string {
  const sydney = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  sydney.setDate(sydney.getDate() + days);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${sydney.getDate()} ${months[sydney.getMonth()]} ${sydney.getFullYear()}`;
}

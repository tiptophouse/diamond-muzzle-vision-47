
// Simplified config that doesn't make network calls
const ADMIN_TELEGRAM_ID = 2138564172;

export async function getAdminTelegramId(): Promise<number> {
  return ADMIN_TELEGRAM_ID;
}

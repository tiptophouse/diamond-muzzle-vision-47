
import { telegramSDK } from './telegramSDK';

export const getTelegramUser = () => {
  return telegramSDK.getUser();
};

export const initializeTelegramAuth = async () => {
  return await telegramSDK.init();
};

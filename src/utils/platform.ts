export const isTelegramWebApp = (): boolean => {
  return Boolean(window.Telegram?.WebApp?.initData);
};

export const isDesktop = (): boolean => {
  return !isTelegramWebApp();
};
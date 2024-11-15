interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export function showNotification({ title, message, type, duration = 3000 }: NotificationOptions) {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.showPopup({
      title,
      message,
      buttons: [{ type: 'ok' }]
    });
  } else {
    // Fallback for desktop/development
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}
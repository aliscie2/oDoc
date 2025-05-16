export class TelegramAPI {
  private static readonly BOT_TOKEN = import.meta.env.VITE_PUBLIC_TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}`;

  static async sendMessage(chatId: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  static async getUpdates(offset?: number): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/getUpdates${offset ? `?offset=${offset}` : ''}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting Telegram updates:', error);
      return null;
    }
  }

  static async getUserInfo(chatId: string): Promise<{username?: string; chatId?: string} | null> {
    try {
      const response = await fetch(`${this.API_URL}/getChat?chat_id=${chatId}`);
      const data = await response.json();
      return {
        username: data.result?.username,
        chatId: data.result?.id
      };
    } catch (error) {
      console.error('Error getting Telegram user info:', error);
      return null;
    }
  }
}
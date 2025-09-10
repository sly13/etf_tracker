export interface ETFNotificationData {
  bitcoinFlow: number;
  ethereumFlow: number;
  bitcoinTotal: number;
  ethereumTotal: number;
  date: string;
  bitcoinData?: any;
  ethereumData?: any;
}

export interface BotUser {
  id: string;
  telegramChatId: string;
  deviceId?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  enableTelegramNotifications: boolean;
  application?: {
    name: string;
    displayName: string;
  };
}

export interface ETFData {
  date: string;
  total: number;
  blackrock: number;
  fidelity: number;
  bitwise: number;
  twentyOneShares: number;
  vanEck: number;
  invesco: number;
  franklin: number;
  grayscale: number;
  grayscaleCrypto?: number;
  grayscaleBtc?: number;
  valkyrie?: number;
  wisdomTree?: number;
}

export interface ExchangePair {
  id: string;
  from: string;
  to: string;
  fee: number;
  feeType: 'percentage' | 'fixed';
}

export interface ExchangeConfig {
  discordInviteUrl: string;
  exchangePairs: ExchangePair[];
}

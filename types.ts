
export enum BotStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export enum BotType {
  CRYPTO = 'CRYPTO',
  MEMECOIN = 'MEMECOIN',
  DAYTRADE = 'DAYTRADE'
}

export enum RiskLevel {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
}

export interface ApiLog {
  id: string;
  timestamp: string;
  source: 'IA' | 'BITGET' | 'SYSTEM' | 'FINANCE';
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface BillingTransaction {
  id: string;
  timestamp: string;
  amount: number;
  type: 'DEPOSIT' | 'FEE_DEDUCTION';
  botName?: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface TradingPair {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isMeme: boolean;
}

export interface SentimentData {
  score: number; // 0 to 100
  label: 'EXTREME FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME GREED';
  trendingNews: string[];
}

export interface BotConfig {
  id: string;
  name: string;
  type: BotType;
  status: BotStatus;
  investment: number;
  stopLoss: number;
  takeProfit: number;
  trailingStop: boolean;
  selectedPairs: string[];
  totalProfit: number;
  tradesCount: number;
}

export interface AIInsights {
  recommendation: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

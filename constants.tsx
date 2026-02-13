
import React from 'react';
import { TradingPair, BotConfig, BotType, BotStatus } from './types';

export const INITIAL_PAIRS: TradingPair[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 64200.50, change24h: 2.5, isMeme: false },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 3450.20, change24h: -1.2, isMeme: false },
  { symbol: 'SOL/USDT', name: 'Solana', price: 145.80, change24h: 5.4, isMeme: false },
  { symbol: 'PEPE/USDT', name: 'Pepe', price: 0.0000085, change24h: 12.8, isMeme: true },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.165, change24h: 3.2, isMeme: true },
  { symbol: 'SHIB/USDT', name: 'Shiba Inu', price: 0.000025, change24h: -2.1, isMeme: true },
  { symbol: 'WIF/USDT', name: 'Dogwifhat', price: 3.42, change24h: 15.6, isMeme: true },
  { symbol: 'BNB/USDT', name: 'Binance Coin', price: 580.10, change24h: 0.8, isMeme: false },
];

export const INITIAL_BOTS: BotConfig[] = [
  {
    id: '1',
    name: 'Mainstream Alpha',
    type: BotType.CRYPTO,
    status: BotStatus.RUNNING,
    investment: 5000,
    stopLoss: 5,
    takeProfit: 15,
    trailingStop: true,
    selectedPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    totalProfit: 450.25,
    tradesCount: 142
  },
  {
    id: '2',
    name: 'Meme Hunter V2',
    type: BotType.MEMECOIN,
    status: BotStatus.IDLE,
    investment: 1500,
    stopLoss: 10,
    takeProfit: 50,
    trailingStop: true,
    selectedPairs: ['PEPE/USDT', 'WIF/USDT'],
    totalProfit: 1205.80,
    tradesCount: 89
  },
  {
    id: '3',
    name: 'Scalper Pro',
    type: BotType.DAYTRADE,
    status: BotStatus.RUNNING,
    investment: 10000,
    stopLoss: 1,
    takeProfit: 2,
    trailingStop: false,
    selectedPairs: ['BTC/USDT'],
    totalProfit: 120.40,
    tradesCount: 345
  }
];

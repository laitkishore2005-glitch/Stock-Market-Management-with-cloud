export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  SL = 'SL',
  SL_M = 'SL-M'
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum ProductType {
  MIS = 'MIS', // Intraday
  CNC = 'CNC', // Delivery
  NRML = 'NRML' // Normal
}

export enum OrderVariety {
  REGULAR = 'REGULAR',
  BO = 'BO', // Bracket Order
  CO = 'CO', // Cover Order
  AMO = 'AMO' // After Market Order
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  sector: string;
}

export interface Candle {
  time: string; // ISO String or readable time
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioPosition {
  symbol: string;
  avgPrice: number;
  quantity: number;
  ltp: number; // Last Traded Price
}

export interface Order {
  id: string;
  symbol: string;
  type: OrderType;
  variety: OrderVariety;
  product: ProductType;
  side: OrderSide;
  quantity: number;
  price: number;
  triggerPrice?: number;
  targetPrice?: number; // For BO
  stopLossPrice?: number; // For BO
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  timestamp: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  percentChange: number;
}

export interface AISentiment {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // 0-100
  summary: string;
  keyLevels: { support: number; resistance: number };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

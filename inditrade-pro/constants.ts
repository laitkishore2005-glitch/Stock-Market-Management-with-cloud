import { Stock, MarketIndex } from './types';

export const INDIAN_INDICES: MarketIndex[] = [
  { name: 'NIFTY 50', value: 22145.65, change: 125.40, percentChange: 0.57 },
  { name: 'SENSEX', value: 73050.80, change: 350.20, percentChange: 0.48 },
  { name: 'BANK NIFTY', value: 46890.10, change: -45.50, percentChange: -0.10 },
  { name: 'NIFTY IT', value: 37500.25, change: 410.00, percentChange: 1.10 },
];

export const MOCK_STOCKS: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2980.50, change: 15.20, changePercent: 0.51, volume: 5400200, high: 2995.00, low: 2960.00, open: 2965.00, prevClose: 2965.30, sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs', price: 4120.00, change: 55.00, changePercent: 1.35, volume: 1200500, high: 4150.00, low: 4080.00, open: 4090.00, prevClose: 4065.00, sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1450.75, change: -12.50, changePercent: -0.85, volume: 8500000, high: 1470.00, low: 1445.00, open: 1468.00, prevClose: 1463.25, sector: 'Finance' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1650.30, change: 22.10, changePercent: 1.36, volume: 3400100, high: 1660.00, low: 1630.00, open: 1635.00, prevClose: 1628.20, sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1080.90, change: 5.40, changePercent: 0.50, volume: 4100200, high: 1090.00, low: 1070.00, open: 1075.00, prevClose: 1075.50, sector: 'Finance' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 980.40, change: 18.60, changePercent: 1.93, volume: 9200500, high: 985.00, low: 965.00, open: 968.00, prevClose: 961.80, sector: 'Auto' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 760.20, change: -3.80, changePercent: -0.50, volume: 6700100, high: 770.00, low: 755.00, open: 768.00, prevClose: 764.00, sector: 'Finance' },
  { symbol: 'ITC', name: 'ITC Limited', price: 435.50, change: 1.20, changePercent: 0.28, volume: 7800000, high: 438.00, low: 432.00, open: 433.00, prevClose: 434.30, sector: 'FMCG' },
];

export const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'];

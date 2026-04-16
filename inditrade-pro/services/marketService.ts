import { Candle, Stock } from '../types';
import { MOCK_STOCKS } from '../constants';

// --- WebSocket Simulation Service ---

type MarketListener = (stock: Stock) => void;

export class MarketSocket {
    private isConnected: boolean = false;
    private subscribers: Map<string, MarketListener[]> = new Map();
    private intervalId: any = null;
    private stocks: Map<string, Stock> = new Map();

    constructor(initialStocks: Stock[]) {
        initialStocks.forEach(s => this.stocks.set(s.symbol, s));
    }

    // Simulate connection
    connect(): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                this.startFeed();
                resolve(true);
            }, 800);
        });
    }

    disconnect() {
        this.isConnected = false;
        if (this.intervalId) clearInterval(this.intervalId);
    }

    subscribe(symbol: string, callback: MarketListener) {
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, []);
        }
        this.subscribers.get(symbol)?.push(callback);
    }

    unsubscribe(symbol: string, callback: MarketListener) {
        const subs = this.subscribers.get(symbol);
        if (subs) {
            this.subscribers.set(symbol, subs.filter(cb => cb !== callback));
        }
    }

    updateStockData(updates: Partial<Stock>[]) {
        updates.forEach(u => {
            if (u.symbol && this.stocks.has(u.symbol)) {
                const current = this.stocks.get(u.symbol)!;
                const updated = { ...current, ...u };
                // Recalculate change value based on percent if needed
                if (u.changePercent !== undefined && u.price !== undefined) {
                    updated.change = parseFloat((u.price - (u.price / (1 + u.changePercent / 100))).toFixed(2));
                }
                this.stocks.set(u.symbol, updated);
            }
        });
    }

    private startFeed() {
        // High frequency tick simulation
        this.intervalId = setInterval(() => {
            if (!this.isConnected) return;

            this.stocks.forEach((stock, symbol) => {
                // Simulate tick
                const volatility = 0.0005; // 0.05% volatility per tick
                const move = (Math.random() - 0.48) * (stock.price * volatility); 
                const newPrice = parseFloat((stock.price + move).toFixed(2));
                const newChange = parseFloat((stock.change + move).toFixed(2));
                const newPercent = parseFloat(((newChange / (stock.price - stock.change)) * 100).toFixed(2));

                const updatedStock = {
                    ...stock,
                    price: newPrice,
                    change: newChange,
                    changePercent: newPercent,
                    volume: stock.volume + Math.floor(Math.random() * 50)
                };

                this.stocks.set(symbol, updatedStock);

                // Notify subscribers
                const subs = this.subscribers.get(symbol);
                if (subs) {
                    subs.forEach(cb => cb(updatedStock));
                }
            });

        }, 1000); // 1-second ticks
    }
}


// --- Helper Functions ---

// Helper to generate a random walk candle
export const generateNextCandle = (prevCandle: Candle): Candle => {
  const volatility = 2.0; // Simulated volatility
  const change = (Math.random() - 0.5) * volatility;
  const close = prevCandle.close + change;
  const high = Math.max(prevCandle.close, close) + Math.random() * 1;
  const low = Math.min(prevCandle.close, close) - Math.random() * 1;
  const open = prevCandle.close;

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    time,
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
    volume: Math.floor(Math.random() * 10000)
  };
};

export const generateHistoricalCandles = (count: number, startPrice: number): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const now = new Date();

  for (let i = count; i > 0; i--) {
    const timeDate = new Date(now.getTime() - i * 60000); // 1 minute intervals
    const volatility = startPrice * 0.002;
    const change = (Math.random() - 0.5) * volatility * 2;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    candles.push({
      time: `${timeDate.getHours().toString().padStart(2, '0')}:${timeDate.getMinutes().toString().padStart(2, '0')}`,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 1000)
    });
    currentPrice = close;
  }
  return candles;
};

// Simulate live price updates for the ticker (Legacy, prefer MarketSocket)
export const simulateLivePrice = (stock: Stock): Stock => {
    const move = (Math.random() - 0.48) * (stock.price * 0.001); // Slight upward bias
    const newPrice = stock.price + move;
    const newChange = stock.change + move;
    const newPercent = (newChange / stock.prevClose) * 100;
    
    return {
        ...stock,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(newChange.toFixed(2)),
        changePercent: parseFloat(newPercent.toFixed(2)),
    };
};

// Search for a stock (Simulated API Call)
export const searchStock = async (query: string): Promise<Stock> => {
    const symbol = query.toUpperCase();
    
    // 1. Check if it's in our local mock list first
    const existing = MOCK_STOCKS.find(s => s.symbol === symbol);
    if (existing) return existing;

    // 2. Simulate API Network Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Generate a deterministic "real" stock based on the symbol string
    // This ensures if you search "ZOMATO" twice, you get the same base price
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate price between 100 and 3000 roughly
    const basePrice = (seed * 17) % 2900 + 100;
    const isPositive = seed % 2 === 0;
    const changePercent = (seed % 50) / 10 * (isPositive ? 1 : -1);
    const change = basePrice * (changePercent / 100);

    return {
        symbol: symbol,
        name: `${symbol} India Ltd`, // Generic name generation
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: 500000 + (seed * 100),
        high: parseFloat((basePrice * 1.02).toFixed(2)),
        low: parseFloat((basePrice * 0.98).toFixed(2)),
        open: parseFloat((basePrice * 0.99).toFixed(2)),
        prevClose: parseFloat((basePrice - change).toFixed(2)),
        sector: 'Equity'
    };
};
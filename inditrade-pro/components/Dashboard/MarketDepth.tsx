import React, { useMemo } from 'react';
import { Stock } from '../../types';

interface MarketDepthProps {
    stock: Stock;
    theme: string;
}

const MarketDepth: React.FC<MarketDepthProps> = ({ stock, theme }) => {
    const isLight = theme === 'light';
    const bgMain = isLight ? 'bg-white' : `bg-${theme}-900`;
    const bgTable = isLight ? 'bg-white' : `bg-${theme}-900`;
    const bgHeader = isLight ? 'bg-slate-50' : `bg-${theme}-900/50`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const rowBorder = isLight ? 'border-slate-100' : `border-${theme}-800/50`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;
    const hoverBg = isLight ? 'hover:bg-slate-50' : `hover:bg-${theme}-800/50`;
    const bgBar = isLight ? 'bg-slate-100' : `bg-${theme}-800`;

    // Simulate depth data based on current stock price
    const { bids, asks, totalBuy, totalSell } = useMemo(() => {
        const basePrice = stock.price;
        const generateDepth = (isBuy: boolean) => {
            return Array.from({ length: 5 }).map((_, i) => {
                const spread = basePrice * 0.0005 * (i + 1);
                const price = isBuy ? basePrice - spread : basePrice + spread;
                const quantity = Math.floor(Math.random() * 500) + 50;
                const orders = Math.floor(Math.random() * 10) + 1;
                return { price, quantity, orders };
            });
        };

        const bids = generateDepth(true);
        const asks = generateDepth(false);
        const totalBuy = bids.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalSell = asks.reduce((acc, curr) => acc + curr.quantity, 0);

        return { bids, asks, totalBuy, totalSell };
    }, [stock.price]);

    const maxQty = Math.max(...bids.map(b => b.quantity), ...asks.map(a => a.quantity));

    return (
        <div className={`${bgMain} border ${borderCol} rounded-lg p-4`}>
            <h3 className={`text-sm font-bold ${textMain} mb-3 flex justify-between items-center`}>
                Market Depth
                <span className={`text-[10px] ${textMuted} font-normal`}>Level II</span>
            </h3>
            
            <div className={`grid grid-cols-2 gap-px ${borderCol} bg-slate-200 border rounded overflow-hidden`}>
                {/* Headers */}
                <div className={`${bgHeader} p-2 text-[10px] font-bold text-blue-500 uppercase flex justify-between`}>
                    <span>Bid</span>
                    <span>Orders</span>
                    <span>Qty</span>
                </div>
                <div className={`${bgHeader} p-2 text-[10px] font-bold text-red-500 uppercase flex justify-between`}>
                    <span>Ask</span>
                    <span>Orders</span>
                    <span>Qty</span>
                </div>

                {/* Rows */}
                <div className={bgTable}>
                    {bids.map((bid, i) => (
                        <div key={i} className={`relative flex justify-between items-center p-1.5 text-xs border-b ${rowBorder} last:border-0 ${hoverBg}`}>
                            {/* Liquidity Bar */}
                            <div 
                                className="absolute top-0 bottom-0 right-0 bg-blue-500/10 z-0 transition-all duration-300"
                                style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
                            />
                            <span className={`${textMain} relative z-10 font-mono`}>{bid.price.toFixed(2)}</span>
                            <span className={`${textMuted} relative z-10`}>{bid.orders}</span>
                            <span className="text-blue-500 relative z-10 font-medium">{bid.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className={bgTable}>
                    {asks.map((ask, i) => (
                        <div key={i} className={`relative flex justify-between items-center p-1.5 text-xs border-b ${rowBorder} last:border-0 ${hoverBg}`}>
                             {/* Liquidity Bar */}
                             <div 
                                className="absolute top-0 bottom-0 left-0 bg-red-500/10 z-0 transition-all duration-300"
                                style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
                            />
                            <span className={`${textMain} relative z-10 font-mono`}>{ask.price.toFixed(2)}</span>
                            <span className={`${textMuted} relative z-10`}>{ask.orders}</span>
                            <span className="text-red-500 relative z-10 font-medium">{ask.quantity}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className={`${bgMain} p-2 flex justify-between items-center border-t ${borderCol}`}>
                    <span className={`text-[10px] ${textMuted}`}>Total</span>
                    <span className="text-xs font-bold text-blue-500">{totalBuy.toLocaleString()}</span>
                </div>
                <div className={`${bgMain} p-2 flex justify-between items-center border-t ${borderCol}`}>
                    <span className={`text-[10px] ${textMuted}`}>Total</span>
                    <span className="text-xs font-bold text-red-500">{totalSell.toLocaleString()}</span>
                </div>
            </div>

            {/* Imbalance Indicator */}
            <div className="mt-3">
                <div className={`flex justify-between text-[10px] ${textMuted} mb-1`}>
                    <span>{((totalBuy / (totalBuy + totalSell)) * 100).toFixed(0)}% Buy</span>
                    <span>{((totalSell / (totalBuy + totalSell)) * 100).toFixed(0)}% Sell</span>
                </div>
                <div className={`h-1.5 w-full ${bgBar} rounded-full overflow-hidden flex`}>
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(totalBuy / (totalBuy + totalSell)) * 100}%` }}
                    />
                    <div 
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${(totalSell / (totalBuy + totalSell)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketDepth;
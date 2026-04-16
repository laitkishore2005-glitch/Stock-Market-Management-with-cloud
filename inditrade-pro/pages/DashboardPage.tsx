import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import MarketTicker from '../components/Dashboard/MarketTicker';
import ChartWidget from '../components/Dashboard/ChartWidget';
import OrderEntry from '../components/Dashboard/OrderEntry';
import MarketDepth from '../components/Dashboard/MarketDepth';
import ChatBot from '../components/Dashboard/ChatBot';
import { MOCK_STOCKS, INDIAN_INDICES } from '../constants';
import { Stock, Candle, AISentiment, Order, OrderSide, PortfolioPosition } from '../types';
import { generateHistoricalCandles, generateNextCandle, simulateLivePrice, searchStock, MarketSocket } from '../services/marketService';
import { analyzeStock, getComplexMarketAnalysis } from '../services/geminiService';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    Search, Bell, Cpu, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, 
    Clock, ShieldCheck, FileText, Loader2, User, Mail, Phone, CreditCard, 
    Save, Smartphone, CheckCircle, LayoutGrid, Activity, Palette, Zap, RefreshCw,
    Filter, Download, ExternalLink, ChevronRight, Eye, MoreHorizontal, Settings,
    History, AlertTriangle, Briefcase, Newspaper, BarChart3, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, LineChart, Line
} from 'recharts';

// --- Sub-Components for different Tabs ---

const DashboardHome: React.FC<{
    stocks: Stock[];
    selectedStock: Stock;
    setSelectedStock: (s: Stock) => void;
    candles: Candle[];
    handleOrder: (order: any) => void;
    aiAnalysis: AISentiment | null;
    isAnalyzing: boolean;
    handleAiAnalysis: (s: Stock) => void;
    theme: string;
}> = ({ stocks, selectedStock, setSelectedStock, candles, handleOrder, aiAnalysis, isAnalyzing, handleAiAnalysis, theme }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;
    const itemHover = isLight ? 'hover:bg-slate-50' : `hover:bg-${theme}-800/50`;
    const itemActive = isLight ? 'bg-slate-100 border-l-blue-600' : `bg-${theme}-800 border-l-blue-500`;

    return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 h-full">
        {/* Watchlist */}
        <div className={`col-span-12 lg:col-span-3 ${bgCard} border ${borderCol} rounded-lg flex flex-col h-[calc(100vh-180px)]`}>
            <div className={`p-4 border-b ${borderCol} flex justify-between items-center`}>
                <h2 className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : `text-${theme}-100`}`}>
                    <TrendingUp size={16} className="text-blue-500"/> Market Watch
                </h2>
            </div>
            <div className="overflow-y-auto flex-1 no-scrollbar">
                {stocks.map(stock => (
                    <div 
                        key={stock.symbol}
                        onClick={() => { setSelectedStock(stock); handleAiAnalysis(stock); }}
                        className={`p-3 border-b ${borderCol} cursor-pointer transition-colors border-l-2 ${selectedStock.symbol === stock.symbol ? itemActive : `${itemHover} border-l-transparent`}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">{stock.symbol}</span>
                            <span className={`font-mono text-sm ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                                {stock.price.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${textMuted}`}>{stock.name}</span>
                            <span className={`text-xs ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                                {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Center Column: Chart & Depth */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-[calc(100vh-180px)] overflow-y-auto pr-1 no-scrollbar">
            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-4">
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-lg`}>
                    <p className={`text-[10px] ${textMuted} font-bold uppercase mb-1`}>Total P&L</p>
                    <p className="text-xl font-mono font-bold text-green-500">+₹12,450.50</p>
                    </div>
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-lg`}>
                    <p className={`text-[10px] ${textMuted} font-bold uppercase mb-1`}>Available Margin</p>
                    <p className={`text-xl font-mono font-bold ${textMain}`}>₹1,50,000</p>
                    </div>
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-lg`}>
                    <p className={`text-[10px] ${textMuted} font-bold uppercase mb-1`}>Invested</p>
                    <p className={`text-xl font-mono font-bold ${textMain}`}>₹8,40,200</p>
                    </div>
            </div>

            {/* Chart */}
            <div className="min-h-[400px]">
                <ChartWidget data={candles} selectedStock={selectedStock} theme={theme} />
            </div>

            {/* Market Depth */}
            <div>
                <MarketDepth stock={selectedStock} theme={theme} />
            </div>
        </div>

        {/* Right Panel: Order & AI */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
            
            {/* Order Entry */}
            <div className="min-h-[450px]">
                <OrderEntry stock={selectedStock} onPlaceOrder={handleOrder} theme={theme} />
            </div>

            {/* AI Analysis Widget */}
            <div className={`flex-1 min-h-[300px] ${bgCard} border ${borderCol} rounded-lg p-4 flex flex-col overflow-hidden relative`}>
                    <div className="flex items-center gap-2 mb-3">
                    <Cpu size={18} className="text-purple-500" />
                    <h3 className={`font-bold ${textMain} text-sm`}>Gemini Market AI</h3>
                    </div>

                    {isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-purple-400 animate-pulse">Analyzing market data...</span>
                        </div>
                    ) : aiAnalysis ? (
                        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
                            <div className={`flex justify-between items-center ${isLight ? 'bg-slate-100' : `bg-${theme}-800`} p-2 rounded`}>
                                <span className={`text-xs ${textMuted}`}>Signal</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    aiAnalysis.sentiment === 'BULLISH' ? 'bg-green-500/20 text-green-500' : 
                                    aiAnalysis.sentiment === 'BEARISH' ? 'bg-red-500/20 text-red-500' : `bg-slate-200 text-slate-500`
                                }`}>{aiAnalysis.sentiment}</span>
                            </div>
                            <div className={`flex justify-between items-center ${isLight ? 'bg-slate-100' : `bg-${theme}-800`} p-2 rounded`}>
                                <span className={`text-xs ${textMuted}`}>Confidence</span>
                                <div className={`w-24 h-1.5 ${isLight ? 'bg-slate-200' : `bg-${theme}-700`} rounded-full overflow-hidden`}>
                                    <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                                    style={{width: `${aiAnalysis.score}%`}}
                                    />
                                </div>
                            </div>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : `text-${theme}-300`} leading-relaxed ${isLight ? 'bg-slate-50' : `bg-${theme}-800/30`} p-2 rounded border ${isLight ? 'border-slate-100' : `border-${theme}-700/50`}`}>
                                {aiAnalysis.summary}
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className={`${isLight ? 'bg-slate-100' : `bg-${theme}-800`} p-2 rounded text-center`}>
                                    <p className={`text-[10px] ${textMuted} uppercase`}>Support</p>
                                    <p className="text-xs font-mono text-green-500">₹{aiAnalysis.keyLevels.support}</p>
                                </div>
                                <div className={`${isLight ? 'bg-slate-100' : `bg-${theme}-800`} p-2 rounded text-center`}>
                                    <p className={`text-[10px] ${textMuted} uppercase`}>Resistance</p>
                                    <p className="text-xs font-mono text-red-500">₹{aiAnalysis.keyLevels.resistance}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-center ${textMuted} text-sm mt-10`}>Select a stock to analyze</div>
                    )}

                    {/* Decorative background glow */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
            </div>
        </div>
    </div>
    );
};

const MarketsView = ({ theme, stocks, onSelectStock }: { theme: string, stocks: Stock[], onSelectStock: (s: Stock) => void }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Indian Markets Explorer</h1>
                <div className="flex gap-2">
                    <button className={`px-3 py-1.5 rounded-lg border ${borderCol} ${bgCard} text-xs flex items-center gap-2`}>
                        <Filter size={14} /> Filters
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
                        Add Custom Watchlist
                    </button>
                </div>
            </div>

            <div className={`${bgCard} border ${borderCol} rounded-xl overflow-hidden`}>
                <table className="w-full text-left border-collapse">
                    <thead className={`${isLight ? 'bg-slate-50' : `bg-${theme}-800/50`} border-b ${borderCol}`}>
                        <tr>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider`}>Symbol</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider`}>Sector</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider text-right`}>Price (₹)</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider text-right`}>Change</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider text-right`}>Volume</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider text-right`}>Day Range</th>
                            <th className={`px-6 py-4 text-xs font-bold ${textMuted} uppercase tracking-wider`}></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                        {stocks.map(stock => (
                            <tr key={stock.symbol} className={`${isLight ? 'hover:bg-slate-50' : `hover:bg-${theme}-800/30`} transition-colors group cursor-pointer`} onClick={() => onSelectStock(stock)}>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className={`font-bold ${textMain}`}>{stock.symbol}</p>
                                        <p className={`text-[10px] ${textMuted}`}>{stock.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${borderCol} ${textMuted}`}>
                                        {stock.sector}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-medium ${textMain}`}>
                                    {stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`px-6 py-4 text-right font-mono`}>
                                    <div className={stock.change >= 0 ? 'text-up' : 'text-down'}>
                                        <p className="font-bold">{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}</p>
                                        <p className="text-[10px] opacity-80">{stock.changePercent.toFixed(2)}%</p>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-right text-xs ${textMuted}`}>
                                    {(stock.volume / 100000).toFixed(1)}L
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="w-32 inline-block">
                                        <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-mono">
                                            <span>{stock.low}</span>
                                            <span>{stock.high}</span>
                                        </div>
                                        <div className={`h-1 w-full ${isLight ? 'bg-slate-200' : `bg-${theme}-800`} rounded-full relative`}>
                                            <div 
                                                className="absolute h-full bg-blue-500 rounded-full"
                                                style={{ 
                                                    left: `${((stock.price - stock.low) / (stock.high - stock.low)) * 100}%`,
                                                    width: '4px',
                                                    marginLeft: '-2px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-all">
                                        <Zap size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PortfolioView = ({ theme }: { theme: string }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    const holdings = [
        { symbol: 'RELIANCE', qty: 50, avg: 2840, ltp: 2980.50, profit: 7025 },
        { symbol: 'TCS', qty: 20, avg: 3950, ltp: 4120.00, profit: 3400 },
        { symbol: 'TATAMOTORS', qty: 100, avg: 820, ltp: 980.40, profit: 16040 },
        { symbol: 'HDFCBANK', qty: 30, avg: 1510, ltp: 1450.75, profit: -1777.5 }
    ];

    const distributionData = [
        { name: 'Energy', value: 45, color: '#3b82f6' },
        { name: 'IT', value: 25, color: '#8b5cf6' },
        { name: 'Auto', value: 20, color: '#10b981' },
        { name: 'Finance', value: 10, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Your Portfolio</h1>
                <button className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20`}>
                    <Download size={16} /> Export Statement
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm`}>
                    <p className={`text-xs ${textMuted} font-bold uppercase tracking-widest mb-2`}>Current Value</p>
                    <p className="text-3xl font-mono font-bold text-blue-500">₹8,52,650</p>
                    <div className="flex items-center gap-1 text-xs text-green-500 mt-2 font-bold">
                        <TrendingUp size={12} /> +1.45% Today
                    </div>
                </div>
                <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl shadow-sm`}>
                    <p className={`text-xs ${textMuted} font-bold uppercase tracking-widest mb-1`}>Total Invested</p>
                    <p className={`text-2xl font-mono font-bold ${textMain}`}>₹8,40,200</p>
                    <p className={`text-[10px] ${textMuted} mt-4`}>Average Daily Turnover</p>
                    <p className={`text-xs font-mono ${textMain}`}>₹42,500.20</p>
                </div>
                <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl shadow-sm`}>
                    <p className={`text-xs ${textMuted} font-bold uppercase tracking-widest mb-1`}>Total P&L</p>
                    <p className="text-2xl font-mono font-bold text-green-500">+₹12,450.50</p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500">Realized: ₹2,100</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">Unrealized: ₹10,350</span>
                    </div>
                </div>
                <div className={`${bgCard} border ${borderCol} p-4 rounded-2xl shadow-sm flex items-center justify-center`}>
                     <div className="w-full h-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie 
                                    data={distributionData} 
                                    innerRadius={25} 
                                    outerRadius={40} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </RePie>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex flex-col gap-1 ml-4">
                        {distributionData.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className={`text-[10px] ${textMuted}`}>{d.name} ({d.value}%)</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            <div className={`${bgCard} border ${borderCol} rounded-2xl overflow-hidden shadow-sm`}>
                <div className="p-4 border-b border-slate-800/10 flex justify-between items-center">
                    <h3 className="font-bold">Holdings (4)</h3>
                    <div className="flex gap-4 text-xs">
                        <span className={textMuted}>Invested: <span className={textMain}>₹8.40L</span></span>
                        <span className={textMuted}>Current: <span className={textMain}>₹8.52L</span></span>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className={`${isLight ? 'bg-slate-50' : `bg-${theme}-800/30`} text-[10px] font-bold ${textMuted} uppercase`}>
                        <tr>
                            <th className="px-6 py-3">Instrument</th>
                            <th className="px-6 py-3 text-right">Qty</th>
                            <th className="px-6 py-3 text-right">Avg. Price</th>
                            <th className="px-6 py-3 text-right">LTP</th>
                            <th className="px-6 py-3 text-right">Cur. Value</th>
                            <th className="px-6 py-3 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                        {holdings.map(h => (
                            <tr key={h.symbol} className={`${isLight ? 'hover:bg-slate-50' : `hover:bg-${theme}-800/20`}`}>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm">{h.symbol}</p>
                                    <p className={`text-[10px] ${textMuted}`}>Equity • NSE</p>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${textMain}`}>{h.qty}</td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${textMain}`}>₹{h.avg.toFixed(2)}</td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${h.ltp >= h.avg ? 'text-up' : 'text-down'}`}>₹{h.ltp.toFixed(2)}</td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${textMain}`}>₹{(h.qty * h.ltp).toLocaleString()}</td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${h.profit >= 0 ? 'text-up' : 'text-down'}`}>
                                    <p className="font-bold">{h.profit >= 0 ? '+' : ''}{h.profit.toLocaleString()}</p>
                                    <p className="text-[10px] opacity-70">{((h.profit / (h.qty * h.avg)) * 100).toFixed(2)}%</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrdersView = ({ theme }: { theme: string }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    const orders = [
        { id: '#4512', time: '11:24:05', symbol: 'ZOMATO', side: 'BUY', qty: 250, price: 165.40, status: 'EXECUTED', type: 'MARKET' },
        { id: '#4511', time: '11:15:20', symbol: 'RELIANCE', side: 'SELL', qty: 50, price: 2985.00, status: 'PENDING', type: 'LIMIT' },
        { id: '#4510', time: '10:45:12', symbol: 'TCS', side: 'BUY', qty: 20, price: 4120.00, status: 'EXECUTED', type: 'LIMIT' },
        { id: '#4509', time: '09:30:00', symbol: 'TATAMOTORS', side: 'BUY', qty: 100, price: 985.50, status: 'REJECTED', type: 'SL-M' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Order History</h1>
                <div className="flex bg-slate-800/40 p-1 rounded-lg border border-slate-700">
                    <button className="px-4 py-1.5 rounded-md text-xs font-bold bg-blue-600 text-white">All Orders</button>
                    <button className={`px-4 py-1.5 rounded-md text-xs font-medium ${textMuted}`}>Open (1)</button>
                    <button className={`px-4 py-1.5 rounded-md text-xs font-medium ${textMuted}`}>Executed (2)</button>
                </div>
            </div>

            <div className={`${bgCard} border ${borderCol} rounded-xl overflow-hidden shadow-xl`}>
                <table className="w-full text-left">
                    <thead className={`${isLight ? 'bg-slate-50' : `bg-${theme}-800/40`} text-[10px] font-bold ${textMuted} uppercase`}>
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Symbol</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Side</th>
                            <th className="px-6 py-4 text-right">Qty</th>
                            <th className="px-6 py-4 text-right">Avg Price</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                        {orders.map(order => (
                            <tr key={order.id} className={`${isLight ? 'hover:bg-slate-50' : `hover:bg-${theme}-800/20`}`}>
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{order.time}</td>
                                <td className="px-6 py-4 font-bold text-sm">{order.symbol}</td>
                                <td className={`px-6 py-4 text-xs ${textMuted}`}>{order.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.side === 'BUY' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {order.side}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${textMain}`}>{order.qty}</td>
                                <td className={`px-6 py-4 text-right font-mono text-sm ${textMain}`}>₹{order.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${
                                        order.status === 'EXECUTED' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                        order.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                        'border-red-500/30 text-red-500 bg-red-500/5'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AnalyticsView = ({ theme }: { theme: string }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    const performanceData = [
        { month: 'Jan', profit: 4500 }, { month: 'Feb', profit: -1200 }, { month: 'Mar', profit: 8900 },
        { month: 'Apr', profit: 5600 }, { month: 'May', profit: 12450 }, { month: 'Jun', profit: 15200 },
    ];

    const sectorExposure = [
        { name: 'Energy', value: 450000 }, { name: 'IT', value: 210000 },
        { name: 'Auto', value: 180000 }, { name: 'Finance', value: 95000 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold">Performance Analytics</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl`}>
                    <h3 className="font-bold mb-6 text-sm flex items-center gap-2">
                        <BarChart3 size={16} className="text-blue-500" /> Monthly Profitability
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <XAxis dataKey="month" stroke={textMuted} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke={textMuted} fontSize={10} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ background: isLight ? 'white' : '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl`}>
                    <h3 className="font-bold mb-6 text-sm flex items-center gap-2">
                        <PieChart size={16} className="text-purple-500" /> Sector Allocation
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie 
                                    data={sectorExposure} 
                                    innerRadius={60} 
                                    outerRadius={90} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                >
                                    {sectorExposure.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} stroke="none" />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl`}>
                <h3 className="font-bold mb-4 text-sm">Key Performance Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/50">
                        <p className={`text-[10px] ${textMuted} uppercase mb-1`}>Win Rate</p>
                        <p className={`text-xl font-bold ${textMain}`}>64.5%</p>
                    </div>
                    <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/50">
                        <p className={`text-[10px] ${textMuted} uppercase mb-1`}>Risk/Reward</p>
                        <p className={`text-xl font-bold ${textMain}`}>1 : 2.4</p>
                    </div>
                    <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/50">
                        <p className={`text-[10px] ${textMuted} uppercase mb-1`}>Drawdown</p>
                        <p className="text-xl font-bold text-red-500">4.2%</p>
                    </div>
                    <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/50">
                        <p className={`text-[10px] ${textMuted} uppercase mb-1`}>Sharpe Ratio</p>
                        <p className="text-xl font-bold text-green-500">2.1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsView = ({ theme }: { theme: string }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    const news = [
        { id: 1, title: 'Reliance Industries to invest ₹75,000 crore in clean energy ecosystem', time: '12m ago', source: 'LiveMint', impact: 'Positive' },
        { id: 2, title: 'Nifty IT index hits 52-week high as global demand remains robust', time: '1h ago', source: 'Economic Times', impact: 'Positive' },
        { id: 3, title: 'RBI keeps interest rates unchanged at 6.5% for sixth consecutive time', time: '3h ago', source: 'MoneyControl', impact: 'Neutral' },
        { id: 4, title: 'Tata Motors shares surge 4% after report of PV business spinoff', time: '5h ago', source: 'Business Standard', impact: 'Positive' },
        { id: 5, title: 'Consumer inflation rises to 5.6% in January, slightly above estimates', time: '1d ago', source: 'NDTV Profit', impact: 'Negative' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-2xl font-bold flex items-center gap-3">
                <Newspaper className="text-blue-500" /> Market Pulse
            </h1>
            
            <div className="grid gap-4">
                {news.map(item => (
                    <div key={item.id} className={`${bgCard} border ${borderCol} p-5 rounded-2xl flex items-start gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group`}>
                        <div className={`mt-1 p-2 rounded-lg bg-slate-800/50 border border-slate-700 ${item.impact === 'Positive' ? 'text-green-500' : item.impact === 'Negative' ? 'text-red-500' : 'text-slate-400'}`}>
                            {item.impact === 'Positive' ? <TrendingUp size={20} /> : item.impact === 'Negative' ? <ArrowDownRight size={20} /> : <Activity size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>{item.source} • {item.time}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    item.impact === 'Positive' ? 'bg-green-500/10 text-green-500' :
                                    item.impact === 'Negative' ? 'bg-red-500/10 text-red-500' :
                                    'bg-slate-500/10 text-slate-500'
                                }`}>{item.impact} Impact</span>
                            </div>
                            <h3 className={`font-bold ${textMain} group-hover:text-blue-500 transition-colors`}>{item.title}</h3>
                        </div>
                        <ChevronRight className={`${textMuted} group-hover:text-blue-500`} size={20} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const AlertsView = ({ theme }: { theme: string }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;

    const alerts = [
        { symbol: 'RELIANCE', condition: 'Price > 3000', status: 'Active', created: '2024-05-10' },
        { symbol: 'TCS', condition: 'Price < 4000', status: 'Triggered', created: '2024-05-08' },
        { symbol: 'ZOMATO', condition: 'Volume > 10M', status: 'Active', created: '2024-05-12' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Bell className="text-yellow-500" /> Price Alerts
                </h1>
                <button className="px-4 py-2 bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-lg shadow-yellow-500/20 flex items-center gap-2">
                    <Zap size={16} /> Create New Alert
                </button>
            </div>

            <div className="grid gap-4">
                {alerts.map((alert, i) => (
                    <div key={i} className={`${bgCard} border ${borderCol} p-4 rounded-xl flex justify-between items-center`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${alert.status === 'Active' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{alert.symbol}</h3>
                                <p className={`text-xs ${textMuted}`}>{alert.condition}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${alert.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                {alert.status}
                            </span>
                            <p className={`text-[9px] ${textMuted} mt-2`}>Created: {alert.created}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsView = ({ theme, userProfile, onUpdateProfile }: { theme: string, userProfile: any, onUpdateProfile: (data: any) => void }) => {
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-400`;
    const inputBg = isLight ? 'bg-slate-50' : `bg-${theme}-800/50`;

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({ 
        name: userProfile?.displayName || '', 
        email: userProfile?.email || '', 
        phone: userProfile?.phone || '',
        id: userProfile?.uid?.slice(-6) || 'N/A'
    });
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        await onUpdateProfile({
            displayName: tempProfile.name,
            phone: tempProfile.phone
        });
        setIsEditing(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleCancel = () => {
        setTempProfile({ 
            name: userProfile?.displayName || '', 
            email: userProfile?.email || '', 
            phone: userProfile?.phone || '',
            id: userProfile?.uid?.slice(-6) || 'N/A'
        });
        setIsEditing(false);
    };

    const initials = (userProfile?.displayName || 'User').split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold flex items-center gap-3">
                <Settings className="text-slate-500" /> Terminal Settings
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                    <div className={`${bgCard} border ${borderCol} p-6 rounded-2xl shadow-sm text-center relative overflow-hidden`}>
                        {isSaved && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full animate-in fade-in zoom-in duration-300">
                                <CheckCircle size={10} /> Saved
                            </div>
                        )}

                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-slate-800 transition-all">
                            {initials || 'JD'}
                        </div>

                        {!isEditing ? (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold">{userProfile?.displayName || 'User'}</h2>
                                <p className={`text-xs ${textMuted} mb-4`}>Premium Account • ID: {userProfile?.uid?.slice(-6) || 'N/A'}</p>
                                <div className={`text-[10px] ${textMuted} mb-4 space-y-1`}>
                                    <p className="flex items-center justify-center gap-1"><Mail size={10} /> {userProfile?.email || 'N/A'}</p>
                                    <p className="flex items-center justify-center gap-1"><Phone size={10} /> {userProfile?.phone || 'N/A'}</p>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-2 bg-slate-800 rounded-lg text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User size={14} /> Edit Profile
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-3">
                                <div className="text-left">
                                    <label className={`text-[10px] ${textMuted} uppercase font-bold ml-1 mb-1 block`}>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={tempProfile.name} 
                                        onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                        className={`w-full ${inputBg} border ${borderCol} rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 transition-all`}
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="text-left">
                                    <label className={`text-[10px] ${textMuted} uppercase font-bold ml-1 mb-1 block`}>Email</label>
                                    <input 
                                        type="email" 
                                        value={tempProfile.email} 
                                        onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                                        className={`w-full ${inputBg} border ${borderCol} rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 transition-all`}
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="text-left">
                                    <label className={`text-[10px] ${textMuted} uppercase font-bold ml-1 mb-1 block`}>Phone</label>
                                    <input 
                                        type="tel" 
                                        value={tempProfile.phone} 
                                        onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                                        className={`w-full ${inputBg} border ${borderCol} rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 transition-all`}
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={handleSave}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={handleCancel}
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold border border-slate-700 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`${bgCard} border ${borderCol} p-4 rounded-2xl space-y-2`}>
                        <h4 className={`text-[10px] font-bold ${textMuted} uppercase tracking-wider`}>Plan Details</h4>
                        <div className="flex justify-between items-center text-sm">
                            <span>Status</span>
                            <span className="text-green-500 font-bold">Active</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>Expiry</span>
                            <span className={textMain}>24 Dec 2024</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 space-y-6">
                    <div className={`${bgCard} border ${borderCol} rounded-2xl overflow-hidden`}>
                        <div className={`p-4 ${isLight ? 'bg-slate-50' : `bg-${theme}-800/40`} border-b ${borderCol} font-bold text-sm`}>
                            Preferences
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm">Biometric Login</p>
                                    <p className={`text-xs ${textMuted}`}>Use FaceID or Fingerprint for authentication</p>
                                </div>
                                <div className="w-10 h-6 bg-blue-600 rounded-full relative shadow-inner">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm">Order Confirmations</p>
                                    <p className={`text-xs ${textMuted}`}>Show confirmation dialog before placing orders</p>
                                </div>
                                <div className="w-10 h-6 bg-slate-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm">Instant Execution</p>
                                    <p className={`text-xs ${textMuted}`}>Execute market orders without secondary check</p>
                                </div>
                                <div className="w-10 h-6 bg-slate-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${bgCard} border ${borderCol} rounded-2xl overflow-hidden`}>
                        <div className={`p-4 ${isLight ? 'bg-slate-50' : `bg-${theme}-800/40`} border-b ${borderCol} font-bold text-sm`}>
                            Security
                        </div>
                        <div className="p-6 space-y-4">
                            <button className="w-full p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 text-left flex justify-between items-center hover:bg-slate-800/40 transition-all group">
                                <div>
                                    <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">Two-Factor Authentication</p>
                                    <p className={`text-[10px] ${textMuted}`}>Currently Enabled (Authenticator App)</p>
                                </div>
                                <ShieldCheck size={20} className="text-green-500" />
                            </button>
                            <button className="w-full p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 text-left flex justify-between items-center hover:bg-slate-800/40 transition-all group">
                                <div>
                                    <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">Change Access PIN</p>
                                    <p className={`text-[10px] ${textMuted}`}>Last changed 3 months ago</p>
                                </div>
                                <ChevronRight size={20} className={textMuted} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedStock, setSelectedStock] = useState<Stock>(MOCK_STOCKS[0]);
    const [candles, setCandles] = useState<Candle[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<AISentiment | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [theme, setTheme] = useState('slate');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [complexAnalysis, setComplexAnalysis] = useState<string>('');
    const [isThinking, setIsThinking] = useState(false);
    
    // Real-time State
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const marketSocketRef = useRef<MarketSocket | null>(null);

    // Firebase Auth & Firestore Sync
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile({
                            uid: user.uid,
                            displayName: user.displayName,
                            email: user.email,
                            photoURL: user.photoURL,
                            role: 'user'
                        });
                    }
                }, (error) => {
                    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
                });
                return () => unsubscribeDoc();
            } else {
                window.location.hash = '';
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const updateProfile = async (data: any) => {
        if (!auth.currentUser) return;
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        window.location.hash = '';
        window.location.reload(); // Force reload to clear state
    };

    const handleComplexAnalysis = async () => {
        setIsThinking(true);
        const result = await getComplexMarketAnalysis(`Provide a deep technical analysis for ${selectedStock.symbol} considering current price of ₹${selectedStock.price} and its ${selectedStock.changePercent}% change.`);
        setComplexAnalysis(result);
        setIsThinking(false);
    };

    const isLight = theme === 'light';
    const bgApp = isLight ? 'bg-slate-50' : `bg-${theme}-950`;
    const textBase = isLight ? 'text-slate-900' : `text-${theme}-100`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const headerBg = isLight ? 'bg-white/80' : `bg-${theme}-900/50`;
    const searchBg = isLight ? 'bg-slate-100 border-slate-200' : `bg-${theme}-800 border-${theme}-700`;
    const iconBtnHover = isLight ? 'hover:bg-slate-200 hover:text-slate-900' : `hover:text-white hover:bg-${theme}-800`;
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-400`;

    // Initialize Market Socket
    useEffect(() => {
        marketSocketRef.current = new MarketSocket(stocks);
        marketSocketRef.current.connect().then(() => {
            setIsLiveConnected(true);
        });
        
        // Initial Live Data Sync
        syncWithRealMarket();

        return () => {
            marketSocketRef.current?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Subscribe to stock updates
    useEffect(() => {
        if (!marketSocketRef.current) return;

        // Subscribe to all visible stocks in watchlist
        stocks.forEach(s => {
            marketSocketRef.current?.subscribe(s.symbol, (updatedStock) => {
                setStocks(prev => prev.map(item => item.symbol === updatedStock.symbol ? updatedStock : item));
                
                // Update selected stock if it matches
                if (selectedStock.symbol === updatedStock.symbol) {
                    setSelectedStock(prev => ({ ...prev, ...updatedStock }));
                    
                    // Update candles roughly every tick
                    setCandles(prev => {
                        if (prev.length === 0) return prev;
                        const last = prev[prev.length - 1];
                        const newCandle = { ...last, close: updatedStock.price, high: Math.max(last.high, updatedStock.price), low: Math.min(last.low, updatedStock.price) };
                         return [...prev.slice(0, -1), newCandle];
                    });
                }
            });
        });

        return () => {
            // Clean up subscriptions would go here
        };
    }, [stocks, selectedStock.symbol]);

    // Initial Data Load for Chart
    useEffect(() => {
        setCandles(generateHistoricalCandles(100, selectedStock.price));
        handleAiAnalysis(selectedStock);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStock.symbol]);

    const handleAiAnalysis = async (stock: Stock) => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        const result = await analyzeStock(stock);
        setAiAnalysis(result);
        setIsAnalyzing(false);
    };

    const syncWithRealMarket = () => {
        console.log("Syncing with real market...");
    };

    const handleOrder = (order: any) => {
        let priceText = '';
        if (order.type === 'MARKET') priceText = 'MKT';
        else if (order.type === 'SL-M') priceText = 'MKT (SL)';
        else priceText = '₹' + order.price;

        let desc = `${order.side} ${order.quantity} ${selectedStock.symbol} @ ${priceText}`;
        
        if (order.variety === 'BO') {
            desc += ` [BO] Tgt: ${order.targetPrice} SL: ${order.stopLossPrice}`;
        } else if (order.variety === 'CO') {
            desc += ` [CO] Trig: ${order.triggerPrice}`;
        } else if (order.type === 'SL' || order.type === 'SL-M') {
            desc += ` Trig: ${order.triggerPrice}`;
        }

        alert(`Order Placed Successfully!\n\n${desc}\nProduct: ${order.product}`);
    };

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsSearching(true);
            try {
                const existing = stocks.find(s => s.symbol === searchQuery.toUpperCase());
                if (existing) {
                    setSelectedStock(existing);
                    handleAiAnalysis(existing);
                    if (activeTab !== 'dashboard') setActiveTab('dashboard'); 
                    setSearchQuery('');
                    setIsSearching(false);
                    return;
                }

                const stock = await searchStock(searchQuery);
                if (stock) {
                    setStocks(prev => [stock, ...prev]);
                    marketSocketRef.current?.subscribe(stock.symbol, (u) => { });
                    setSelectedStock(stock);
                    setCandles(generateHistoricalCandles(100, stock.price));
                    handleAiAnalysis(stock);
                    
                    if (activeTab !== 'dashboard') setActiveTab('dashboard');
                    setSearchQuery('');
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
            case 'watchlist':
                return <DashboardHome 
                    stocks={stocks} 
                    selectedStock={selectedStock} 
                    setSelectedStock={setSelectedStock}
                    candles={candles}
                    handleOrder={handleOrder}
                    aiAnalysis={aiAnalysis}
                    isAnalyzing={isAnalyzing}
                    handleAiAnalysis={handleAiAnalysis}
                    theme={theme}
                />;
            case 'markets': return <MarketsView theme={theme} stocks={stocks} onSelectStock={(s) => { setSelectedStock(s); setActiveTab('dashboard'); }} />;
            case 'portfolio': return <PortfolioView theme={theme} />;
            case 'orders': return <OrdersView theme={theme} />;
            case 'analytics': return <AnalyticsView theme={theme} />;
            case 'news': return <NewsView theme={theme} />;
            case 'alerts': return <AlertsView theme={theme} />;
            case 'settings': return <SettingsView theme={theme} userProfile={userProfile} onUpdateProfile={updateProfile} />;
            default: return <div className={textBase}>Page not found</div>;
        }
    };

    return (
        <div className={`flex h-screen ${bgApp} ${textBase} overflow-hidden font-sans transition-colors duration-300`}>
            <Sidebar 
                collapsed={collapsed} 
                setCollapsed={setCollapsed} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                onLogout={handleLogout} 
                theme={theme}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <MarketTicker theme={theme} />
                
                {/* Header */}
                <header className={`h-16 border-b ${borderCol} ${headerBg} backdrop-blur flex items-center justify-between px-6 z-10`}>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center ${searchBg} rounded-lg px-3 py-2 w-72 md:w-96 border focus-within:border-blue-500 transition-colors`}>
                            {isSearching ? <Loader2 size={18} className="text-blue-500 animate-spin mr-2" /> : <Search size={18} className={`${textMuted} mr-2`} />}
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                disabled={isSearching}
                                placeholder="Search Symbol (e.g., RELIANCE)" 
                                className={`bg-transparent border-none focus:outline-none text-sm ${textBase} w-full placeholder-${isLight ? 'slate-400' : `${theme}-500`}`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLiveConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                             <div className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                             <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{isLiveConnected ? 'Live Feed' : 'Offline'}</span>
                         </div>
                         
                         <button 
                            onClick={syncWithRealMarket}
                            disabled={isSyncing}
                            className={`p-2 ${textMuted} ${iconBtnHover} rounded-full transition-colors`}
                            title="Sync with Market"
                        >
                            <RefreshCw size={20} className={isSyncing ? 'animate-spin text-blue-500' : ''} />
                        </button>

                        <button 
                            onClick={() => {
                                const themes = ['slate', 'zinc', 'neutral', 'stone', 'gray', 'light'];
                                const next = themes[(themes.indexOf(theme) + 1) % themes.length];
                                setTheme(next);
                            }}
                            className={`p-2 ${textMuted} ${iconBtnHover} rounded-full transition-colors`}
                        >
                            <Palette size={20} />
                        </button>

                        <button className={`p-2 ${textMuted} ${iconBtnHover} rounded-full transition-colors relative`}>
                            <Bell size={20} />
                            <span className={`absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border ${isLight ? 'border-white' : `border-${theme}-900`}`}></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 relative no-scrollbar">
                    {renderContent()}
                </div>
            </main>
            <ChatBot theme={theme} />
        </div>
    );
};

export default DashboardPage;
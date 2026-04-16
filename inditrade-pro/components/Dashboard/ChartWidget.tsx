import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { Candle, Stock } from '../../types';
import { TIMEFRAMES } from '../../constants';
import { 
    Maximize2, Activity, PenTool, Slash, Trash2, MousePointer2, 
    TrendingUp, Layers, X, GripHorizontal 
} from 'lucide-react';

interface ChartWidgetProps {
    data: Candle[];
    selectedStock: Stock;
    theme: string;
}

interface DrawingLine {
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const CustomTooltip = ({ active, payload, label, theme, isLight }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const bg = isLight ? 'bg-white' : `bg-${theme}-900`;
        const border = isLight ? 'border-slate-200' : `border-${theme}-700`;
        const labelCol = isLight ? 'text-slate-500' : `text-${theme}-400`;
        const valCol = isLight ? 'text-slate-900' : 'text-white';

        return (
            <div className={`${bg} border ${border} p-3 rounded shadow-xl font-mono text-xs z-50`}>
                <p className={`${labelCol} mb-2 border-b ${border} pb-1`}>{label}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <span className={labelCol}>Open</span> <span className={`${valCol} text-right`}>{data.open}</span>
                    <span className={labelCol}>High</span> <span className="text-green-500 text-right">{data.high}</span>
                    <span className={labelCol}>Low</span> <span className="text-red-500 text-right">{data.low}</span>
                    <span className={labelCol}>Close</span> <span className={`${valCol} text-right font-bold`}>{data.close}</span>
                    <span className={labelCol}>Vol</span> <span className="text-blue-500 text-right">{data.volume}</span>
                    
                    {data.sma20 && (
                         <>
                            <span className="text-orange-400">SMA(20)</span>
                            <span className="text-orange-400 text-right">{data.sma20.toFixed(2)}</span>
                         </>
                    )}
                    {data.ema9 && (
                         <>
                            <span className="text-purple-400">EMA(9)</span>
                            <span className="text-purple-400 text-right">{data.ema9.toFixed(2)}</span>
                         </>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const ChartWidget: React.FC<ChartWidgetProps> = ({ data, selectedStock, theme }) => {
    const [timeframe, setTimeframe] = useState('15m');
    const [indicators, setIndicators] = useState<Set<string>>(new Set(['EMA9'])); // Default EMA on
    const [tool, setTool] = useState<'cursor' | 'line'>('cursor');
    const [lines, setLines] = useState<DrawingLine[]>([]);
    const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const isLight = theme === 'light';
    const isUp = selectedStock.change >= 0;
    const strokeColor = isUp ? '#10b981' : '#ef4444';
    
    // Style constants
    const bgClass = isLight ? 'bg-white' : `bg-${theme}-900`;
    const borderClass = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const textMain = isLight ? 'text-slate-900' : `text-${theme}-100`;
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-400`;
    const btnHover = isLight ? 'hover:bg-slate-100 hover:text-slate-900' : `hover:text-white hover:bg-${theme}-800`;
    const activeBtn = isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400 border border-blue-500/50';
    const gridStroke = isLight ? '#e2e8f0' : '#334155';
    const axisStroke = isLight ? '#94a3b8' : '#64748b';

    // --- Indicator Calculation ---
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        let emaPrev = data[0].close;
        const k = 2 / (9 + 1); // Multiplier for EMA 9

        return data.map((candle, index, arr) => {
            const newItem: any = { ...candle };
            
            // SMA 20
            if (index >= 19) {
                const slice = arr.slice(index - 19, index + 1);
                const sum = slice.reduce((a, b) => a + b.close, 0);
                newItem.sma20 = sum / 20;
            }

            // EMA 9
            if (index === 0) {
                newItem.ema9 = candle.close;
            } else {
                newItem.ema9 = (candle.close * k) + (emaPrev * (1 - k));
                emaPrev = newItem.ema9;
            }

            return newItem;
        });
    }, [data]);

    const toggleIndicator = (name: string) => {
        const newSet = new Set(indicators);
        if (newSet.has(name)) newSet.delete(name);
        else newSet.add(name);
        setIndicators(newSet);
    };

    // --- Drawing Handlers ---
    const getRelativeCoords = (e: React.MouseEvent) => {
        if (!chartContainerRef.current) return { x: 0, y: 0 };
        const rect = chartContainerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool !== 'line') return;
        const { x, y } = getRelativeCoords(e);
        setCurrentLine({ id: Date.now(), x1: x, y1: y, x2: x, y2: y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!currentLine) return;
        const { x, y } = getRelativeCoords(e);
        setCurrentLine(prev => prev ? { ...prev, x2: x, y2: y } : null);
    };

    const handleMouseUp = () => {
        if (currentLine) {
            // Only add if line has length
            if (Math.abs(currentLine.x1 - currentLine.x2) > 2 || Math.abs(currentLine.y1 - currentLine.y2) > 2) {
                setLines(prev => [...prev, currentLine]);
            }
            setCurrentLine(null);
        }
    };

    // Reset lines when stock changes
    useEffect(() => {
        setLines([]);
    }, [selectedStock.symbol]);

    return (
        <div className={`flex flex-col h-full ${bgClass} rounded-lg border ${borderClass} overflow-hidden`}>
            {/* Chart Toolbar */}
            <div className={`flex items-center justify-between px-3 py-2 border-b ${borderClass} ${bgClass} select-none`}>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {/* Symbol Info */}
                    <div className="flex items-center gap-2 mr-2">
                        <span className={`${textMain} font-bold text-sm`}>{selectedStock.symbol}</span>
                        <span className={`text-[10px] ${textMuted} px-1.5 py-0.5 border ${borderClass} rounded`}>NSE</span>
                    </div>

                    <div className={`h-4 w-px ${isLight ? 'bg-slate-300' : `bg-${theme}-700`} mx-1`}></div>

                    {/* Timeframes */}
                    <div className="flex gap-0.5">
                        {TIMEFRAMES.slice(0, 4).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                                    timeframe === tf 
                                    ? 'bg-blue-600 text-white font-medium' 
                                    : `${textMuted} ${btnHover}`
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className={`h-4 w-px ${isLight ? 'bg-slate-300' : `bg-${theme}-700`} mx-1`}></div>

                    {/* Tools */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setTool('cursor')}
                            className={`p-1.5 rounded transition-all ${tool === 'cursor' ? activeBtn : `${textMuted} ${btnHover}`}`}
                            title="Cursor"
                        >
                            <MousePointer2 size={16} />
                        </button>
                        <button 
                            onClick={() => setTool('line')}
                            className={`p-1.5 rounded transition-all ${tool === 'line' ? activeBtn : `${textMuted} ${btnHover}`}`}
                            title="Draw Trendline"
                        >
                            <Slash size={16} />
                        </button>
                    </div>

                    <div className={`h-4 w-px ${isLight ? 'bg-slate-300' : `bg-${theme}-700`} mx-1`}></div>

                    {/* Indicators */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => toggleIndicator('SMA20')}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-all border ${indicators.has('SMA20') ? 'border-orange-500 text-orange-500 bg-orange-500/10' : `border-transparent ${textMuted} ${btnHover}`}`}
                        >
                            SMA 20
                        </button>
                        <button 
                            onClick={() => toggleIndicator('EMA9')}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-all border ${indicators.has('EMA9') ? 'border-purple-500 text-purple-500 bg-purple-500/10' : `border-transparent ${textMuted} ${btnHover}`}`}
                        >
                            EMA 9
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {lines.length > 0 && (
                        <button 
                            onClick={() => setLines([])}
                            className={`p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors`}
                            title="Clear Drawings"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button className={`p-1.5 ${textMuted} ${btnHover} rounded`}>
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div 
                className="flex-1 w-full min-h-[300px] relative cursor-crosshair" 
                ref={chartContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} opacity={0.5} />
                        <XAxis 
                            dataKey="time" 
                            stroke={axisStroke} 
                            tick={{fontSize: 10}} 
                            tickMargin={10} 
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis 
                            domain={['auto', 'auto']} 
                            orientation="right" 
                            stroke={axisStroke} 
                            tick={{fontSize: 10}} 
                            axisLine={false}
                            tickFormatter={(value) => value.toFixed(1)}
                            width={50}
                        />
                        <Tooltip 
                            content={<CustomTooltip theme={theme} isLight={isLight} />} 
                            cursor={tool === 'cursor' ? { stroke: axisStroke, strokeDasharray: '4 4' } : false} 
                        />
                        
                        {/* Main Price Area */}
                        <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke={strokeColor} 
                            fill="url(#colorPrice)" 
                            strokeWidth={2}
                            isAnimationActive={false}
                        />

                        {/* Indicators */}
                        {indicators.has('SMA20') && (
                            <Line 
                                type="monotone" 
                                dataKey="sma20" 
                                stroke="#fb923c" // Orange 400
                                strokeWidth={1.5} 
                                dot={false} 
                                isAnimationActive={false}
                            />
                        )}
                        {indicators.has('EMA9') && (
                            <Line 
                                type="monotone" 
                                dataKey="ema9" 
                                stroke="#c084fc" // Purple 400
                                strokeWidth={1.5} 
                                dot={false} 
                                isAnimationActive={false}
                            />
                        )}

                        <ReferenceLine y={selectedStock.open} stroke={axisStroke} strokeDasharray="3 3" opacity={0.5} label={{ value: 'OPEN', position: 'insideLeft', fill: axisStroke, fontSize: 9 }} />
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Drawing Layer (SVG Overlay) */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
                    {lines.map(line => (
                        <line 
                            key={line.id}
                            x1={line.x1} y1={line.y1}
                            x2={line.x2} y2={line.y2}
                            stroke={isLight ? '#2563eb' : '#60a5fa'} 
                            strokeWidth="2"
                            strokeDasharray="5 5"
                        />
                    ))}
                    {currentLine && (
                        <line 
                            x1={currentLine.x1} y1={currentLine.y1}
                            x2={currentLine.x2} y2={currentLine.y2}
                            stroke={isLight ? '#2563eb' : '#60a5fa'} 
                            strokeWidth="2"
                            opacity={0.7}
                        />
                    )}
                </svg>

                {/* Drawing Mode Indicator */}
                {tool === 'line' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg pointer-events-none animate-in fade-in zoom-in duration-200 flex items-center gap-2">
                        <PenTool size={12} /> Drawing Mode
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartWidget;
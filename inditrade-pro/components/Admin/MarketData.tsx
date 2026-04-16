import React, { useState } from 'react';
import { 
    Database, Zap, Activity, AlertTriangle, RefreshCw, 
    Play, Pause, Settings2, BarChart3, Globe, Shield
} from 'lucide-react';

const MarketData: React.FC = () => {
    const [isLive, setIsLive] = useState(true);
    const [latency, setLatency] = useState(12);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Market Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-lg">Market Data Feed Control</h3>
                            <p className="text-xs text-slate-500">Manage real-time data streams from NSE/BSE</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsLive(!isLive)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isLive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                            >
                                {isLive ? <Play size={16} /> : <Pause size={16} />}
                                {isLive ? 'FEED LIVE' : 'FEED PAUSED'}
                            </button>
                            <button className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Feed Latency</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="500" 
                                    value={latency} 
                                    onChange={(e) => setLatency(parseInt(e.target.value))}
                                    className="flex-1 accent-red-500"
                                />
                                <span className="text-sm font-mono font-bold text-red-500 w-12">{latency}ms</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Integrity</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[98%]"></div>
                                </div>
                                <span className="text-xs font-bold text-green-500">98.4%</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Symbols</label>
                            <div className="text-2xl font-bold text-white">4,281</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6">Exchange Status</h3>
                    <div className="space-y-4">
                        <ExchangeItem name="NSE India" status="Online" latency="8ms" />
                        <ExchangeItem name="BSE India" status="Online" latency="14ms" />
                        <ExchangeItem name="MCX" status="Maintenance" latency="--" />
                        <ExchangeItem name="NIFTY 50" status="Online" latency="5ms" />
                    </div>
                </div>
            </div>

            {/* Data Stream Health */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Real-time Data Stream Health</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Synchronized</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <HealthMetric label="Packet Loss" value="0.002%" status="success" />
                    <HealthMetric label="Buffer Usage" value="14.2%" status="success" />
                    <HealthMetric label="API Calls/sec" value="12,481" status="warning" />
                    <HealthMetric label="WebSocket Conns" value="842" status="success" />
                </div>
            </div>

            {/* Advancement: Market Simulation Engine */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-bold text-lg">Market Simulation Engine</h3>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest">
                        Configure Scenarios
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group">
                        <h4 className="text-sm font-bold mb-2 group-hover:text-red-500 transition-colors">Flash Crash Scenario</h4>
                        <p className="text-xs text-slate-500 mb-4">Simulates a 10% market drop within 5 minutes to test circuit breakers.</p>
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Play size={10} /> Run Simulation
                        </button>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group">
                        <h4 className="text-sm font-bold mb-2 group-hover:text-red-500 transition-colors">High Volatility Spike</h4>
                        <p className="text-xs text-slate-500 mb-4">Injects massive order volume to test matching engine throughput.</p>
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Play size={10} /> Run Simulation
                        </button>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group">
                        <h4 className="text-sm font-bold mb-2 group-hover:text-red-500 transition-colors">Exchange Outage</h4>
                        <p className="text-xs text-slate-500 mb-4">Simulates primary exchange failure and failover to secondary node.</p>
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Play size={10} /> Run Simulation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExchangeItem = ({ name, status, latency }: { name: string, status: string, latency: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="text-right">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${status === 'Online' ? 'text-green-500' : 'text-yellow-500'}`}>
                {status}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{latency}</div>
        </div>
    </div>
);

const HealthMetric = ({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'danger' }) => (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{value}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'success' ? 'bg-green-500' : 
                status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
        </div>
    </div>
);

export default MarketData;

import React from 'react';
import { 
    Server, Cpu, Globe, TrendingUp, Zap, ShieldCheck, 
    AlertCircle, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const data = [
    { name: '00:00', cpu: 20, mem: 30, latency: 10 },
    { name: '04:00', cpu: 25, mem: 32, latency: 12 },
    { name: '08:00', cpu: 45, mem: 40, latency: 15 },
    { name: '12:00', cpu: 70, mem: 55, latency: 25 },
    { name: '16:00', cpu: 65, mem: 50, latency: 20 },
    { name: '20:00', cpu: 40, mem: 45, latency: 15 },
    { name: '23:59', cpu: 30, mem: 35, latency: 12 },
];

const pieData = [
    { name: 'Active', value: 850, color: '#10b981' },
    { name: 'Idle', value: 300, color: '#3b82f6' },
    { name: 'Suspended', value: 134, color: '#ef4444' },
];

const Overview: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Server} 
                    label="Server Status" 
                    value="Operational" 
                    subValue="99.9% Uptime" 
                    status="success" 
                />
                <StatCard 
                    icon={Cpu} 
                    label="CPU Load" 
                    value="24.8%" 
                    subValue="Stable" 
                    status="success" 
                />
                <StatCard 
                    icon={Globe} 
                    label="Active Users" 
                    value="1,284" 
                    subValue="+12% from yesterday" 
                    status="warning" 
                />
                <StatCard 
                    icon={TrendingUp} 
                    label="Market Latency" 
                    value="12ms" 
                    subValue="Optimized" 
                    status="success" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Performance Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg">System Performance</h3>
                            <p className="text-xs text-slate-500">Real-time CPU and Memory utilization</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[10px] text-slate-400 font-bold">CPU</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] text-slate-400 font-bold">MEM</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="#ef4444" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                                <Area type="monotone" dataKey="mem" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Distribution */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6">User Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {pieData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-xs text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Insights Advancement */}
            <div className="bg-gradient-to-r from-red-600/10 to-purple-600/10 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={120} className="text-red-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-400">
                            <Zap size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">AI System Insights</span>
                        </div>
                        <h3 className="text-xl font-bold">Predictive Maintenance Required</h3>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Our AI model has detected a potential bottleneck in the Order Execution Engine. 
                            Projected latency increase of 15% within the next 4 hours due to high NSE volatility. 
                            Recommendation: Scale up Node-B instances.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 whitespace-nowrap">
                        Execute Optimization
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subValue, status }: { icon: any, label: string, value: string, subValue: string, status: 'success' | 'warning' | 'danger' }) => (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-red-500 transition-colors">
                <Icon size={20} />
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                status === 'success' ? 'bg-green-500/10 text-green-500' : 
                status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                'bg-red-500/10 text-red-500'
            }`}>
                {status}
            </div>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
        <p className="text-[10px] text-slate-400">{subValue}</p>
    </div>
);

export default Overview;

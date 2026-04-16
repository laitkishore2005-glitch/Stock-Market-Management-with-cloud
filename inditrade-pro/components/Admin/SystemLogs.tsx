import React, { useState } from 'react';
import { 
    Activity, Search, Filter, Download, Trash2, 
    AlertTriangle, Info, CheckCircle2, Terminal, 
    ChevronLeft, ChevronRight, Clock
} from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'Info' | 'Warning' | 'Critical' | 'Success';
    module: string;
    message: string;
    user: string;
}

const SystemLogs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const logs: LogEntry[] = [
        { id: '1', timestamp: '2026-04-11 06:42:12', level: 'Success', module: 'AUTH', message: 'Admin login successful', user: 'admin@gmail.com' },
        { id: '2', timestamp: '2026-04-11 06:40:05', level: 'Warning', module: 'FEED', message: 'NSE Data feed latency spike detected (450ms)', user: 'SYSTEM' },
        { id: '3', timestamp: '2026-04-11 06:38:44', level: 'Info', module: 'USER', message: 'New user registration: Amit Singh', user: 'SYSTEM' },
        { id: '4', timestamp: '2026-04-11 06:35:21', level: 'Critical', module: 'SECURITY', message: 'Multiple failed login attempts from IP 192.168.1.45', user: 'UNKNOWN' },
        { id: '5', timestamp: '2026-04-11 06:30:10', level: 'Success', module: 'DB', message: 'Daily database backup completed', user: 'SYSTEM' },
        { id: '6', timestamp: '2026-04-11 06:25:55', level: 'Info', module: 'ORDER', message: 'Order executed: BUY 100 RELIANCE @ 2450.50', user: 'rahul.s@example.com' },
        { id: '7', timestamp: '2026-04-11 06:20:12', level: 'Warning', module: 'API', message: 'Rate limit approaching for Gemini API', user: 'SYSTEM' },
        { id: '8', timestamp: '2026-04-11 06:15:00', level: 'Info', module: 'SYSTEM', message: 'Server health check passed', user: 'SYSTEM' },
    ];

    const filteredLogs = logs.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Log Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search logs by message, module, or user..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">
                        <Trash2 size={16} />
                        Clear Logs
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-48">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-24">Level</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">Module</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Message</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-48">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-slate-600" />
                                            {log.timestamp}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                            log.level === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                                            log.level === 'Warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                                            log.level === 'Success' ? 'bg-green-500/10 text-green-500' : 
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {log.level === 'Critical' ? <AlertTriangle size={10} /> : 
                                             log.level === 'Warning' ? <AlertTriangle size={10} /> : 
                                             log.level === 'Success' ? <CheckCircle2 size={10} /> : 
                                             <Info size={10} />}
                                            {log.level}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-300 font-bold">[{log.module}]</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-200">
                                        {log.message}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {log.user}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/20">
                    <p className="text-[10px] text-slate-500">Showing 1 to {filteredLogs.length} of 1,284 entries</p>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-slate-500 hover:text-white disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-6 h-6 rounded bg-red-600 text-white text-[10px] font-bold">1</button>
                            <button className="w-6 h-6 rounded hover:bg-slate-800 text-slate-400 text-[10px] font-bold">2</button>
                            <button className="w-6 h-6 rounded hover:bg-slate-800 text-slate-400 text-[10px] font-bold">3</button>
                        </div>
                        <button className="p-1.5 text-slate-500 hover:text-white">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Advancement: Admin Terminal */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-red-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Terminal</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                    </div>
                </div>
                <div className="p-4 font-mono text-xs space-y-2 h-48 overflow-y-auto bg-black/40">
                    <p className="text-green-500">inditrade-pro@admin:~$ <span className="text-white">system-check --all</span></p>
                    <p className="text-slate-400">[OK] Database connection established</p>
                    <p className="text-slate-400">[OK] Memory usage within limits (1.2GB/4GB)</p>
                    <p className="text-slate-400">[OK] NSE API key valid and active</p>
                    <p className="text-yellow-500">[WARN] 12 unauthorized login attempts blocked in last 10 mins</p>
                    <p className="text-slate-400">[OK] All services operational</p>
                    <p className="text-green-500">inditrade-pro@admin:~$ <span className="animate-pulse">_</span></p>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;

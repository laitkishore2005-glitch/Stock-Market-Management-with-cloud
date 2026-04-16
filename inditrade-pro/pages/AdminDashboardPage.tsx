import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Settings, Database, Shield, 
    Bell, Search, LogOut, Activity
} from 'lucide-react';
import Overview from '../components/Admin/Overview';
import UserManagement from '../components/Admin/UserManagement';
import MarketData from '../components/Admin/MarketData';
import SystemLogs from '../components/Admin/SystemLogs';
import Configurations from '../components/Admin/Configurations';
import ChatBot from '../components/Dashboard/ChatBot';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.hash = 'admin-login';
        window.location.reload(); // Force reload to clear state
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview />;
            case 'users': return <UserManagement />;
            case 'data': return <MarketData />;
            case 'logs': return <SystemLogs />;
            case 'settings': return <Configurations />;
            default: return <Overview />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-6 border-bottom border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                        <Shield size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin<span className="text-red-500">Panel</span></span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Overview" 
                        active={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')} 
                    />
                    <NavItem 
                        icon={Users} 
                        label="User Management" 
                        active={activeTab === 'users'} 
                        onClick={() => setActiveTab('users')} 
                    />
                    <NavItem 
                        icon={Database} 
                        label="Market Data" 
                        active={activeTab === 'data'} 
                        onClick={() => setActiveTab('data')} 
                    />
                    <NavItem 
                        icon={Activity} 
                        label="System Logs" 
                        active={activeTab === 'logs'} 
                        onClick={() => setActiveTab('logs')} 
                    />
                    <NavItem 
                        icon={Settings} 
                        label="Configurations" 
                        active={activeTab === 'settings'} 
                        onClick={() => setActiveTab('settings')} 
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
                    >
                        <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
                        <span className="text-sm font-medium">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            {activeTab === 'data' ? 'Market Data' : activeTab === 'settings' ? 'Configurations' : activeTab.replace('-', ' ')}
                        </h2>
                        <div className="h-4 w-[1px] bg-slate-800"></div>
                        <div className="text-xs font-mono text-slate-400">
                            {currentTime.toLocaleTimeString()} | UTC+5:30
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search system..." 
                                className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-red-500/50 transition-all w-64"
                            />
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold">System Admin</p>
                                <p className="text-[10px] text-green-500 font-mono">ONLINE</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" referrerPolicy="no-referrer" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </div>
            </main>
            <ChatBot theme="slate" />
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-red-500/10 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
    >
        <Icon size={18} className={`${active ? 'text-red-500' : 'group-hover:text-slate-300'}`} />
        <span className="text-sm font-medium">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
    </button>
);

export default AdminDashboardPage;

import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  List, 
  ArrowLeftRight, 
  PieChart, 
  Newspaper, 
  Bell, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    activeTab: string;
    setActiveTab: (t: string) => void;
    onLogout: () => void;
    theme: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, activeTab, setActiveTab, onLogout, theme }) => {
  const isLight = theme === 'light';

  // Dynamic Theme Classes
  const bgClass = isLight ? 'bg-white' : `bg-${theme}-900`;
  const borderClass = isLight ? 'border-slate-200' : `border-${theme}-800`;
  const textMuted = isLight ? 'text-slate-500' : `text-${theme}-400`;
  const hoverClass = isLight ? 'hover:bg-slate-100 hover:text-slate-900' : `hover:bg-${theme}-800/30 hover:text-${theme}-200`;
  const activeClass = isLight ? 'bg-slate-100 text-green-600' : `bg-${theme}-800/50 text-green-500`;
  const toggleBtnClass = isLight ? 'hover:bg-slate-100 text-slate-400' : `hover:bg-${theme}-800 text-${theme}-400`;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'markets', icon: TrendingUp, label: 'Indian Markets' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'watchlist', icon: List, label: 'Watchlist' },
    { id: 'orders', icon: ArrowLeftRight, label: 'Orders' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'news', icon: Newspaper, label: 'News' },
  ];

  const bottomItems = [
      { id: 'alerts', icon: Bell, label: 'Alerts' },
      { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside 
      className={`h-screen border-r flex flex-col transition-all duration-300 ease-in-out z-20 ${collapsed ? 'w-16' : 'w-64'} ${bgClass} ${borderClass}`}
    >
        {/* Logo Area */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${borderClass}`}>
            {!collapsed && (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>IndiTrade</span>
                </div>
            )}
            {collapsed && (
                <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-blue-600 rounded-lg mx-auto flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                </div>
            )}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className={`p-1.5 rounded-md transition-colors ${toggleBtnClass} ${collapsed ? 'hidden' : 'block'}`}
            >
                <ChevronLeft size={18} />
            </button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative
                        ${activeTab === item.id 
                            ? activeClass 
                            : `${textMuted} ${hoverClass}`
                        }
                    `}
                >
                    {activeTab === item.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r" />
                    )}
                    <item.icon size={20} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
            ))}
        </div>

        {/* Bottom Actions */}
        <div className={`py-4 border-t ${borderClass} space-y-1`}>
            {bottomItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative
                        ${activeTab === item.id 
                            ? activeClass 
                            : `${textMuted} ${hoverClass}`
                        }
                    `}
                >
                    {activeTab === item.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r" />
                    )}
                    <item.icon size={20} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
            ))}
            <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
                <LogOut size={20} />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
        </div>
        
        {/* Toggle (Visible only when collapsed) */}
        {collapsed && (
             <button 
                onClick={() => setCollapsed(!collapsed)}
                className={`mx-auto mb-4 p-2 rounded-md ${toggleBtnClass}`}
            >
                <ChevronRight size={18} />
            </button>
        )}
    </aside>
  );
};

export default Sidebar;
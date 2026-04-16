import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, ArrowRight, Lock, Mail, PieChart, Clock, 
    Building2, Activity, ArrowLeft, Zap, BarChart3, ShieldCheck
} from 'lucide-react';
import { INDIAN_INDICES } from '../constants';
import { signInWithGoogle, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [view, setView] = useState<'briefing' | 'login'>('briefing');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) onLogin();
        });
        return () => unsubscribe();
    }, [onLogin]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            onLogin();
        } catch (error) {
            console.error("Google Login Failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Fallback for demo credentials
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-blue-500/30">
            {/* --- Background Ambient Effects --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[100px] animate-pulse duration-[4s]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/5 blur-[100px] animate-pulse duration-[5s] delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
            </div>

            {/* --- Main Container --- */}
            <div className={`relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center min-h-screen transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                
                {/* --- View 1: Market Briefing --- */}
                {view === 'briefing' && (
                    <div className="w-full max-w-5xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="text-center mb-10 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-blue-600 shadow-lg shadow-blue-500/20 mb-4 ring-1 ring-white/10">
                                <TrendingUp size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                IndiTrade Pro
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                                Advanced algorithmic trading terminal for the modern Indian investor.
                            </p>
                        </div>

                        {/* Knowledge Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
                            <BriefingCard 
                                icon={PieChart}
                                color="text-purple-400"
                                title="Equity Basics"
                                description="Stocks represent fractional ownership. Price is driven by earnings & sentiment."
                            />
                            <BriefingCard 
                                icon={Building2}
                                color="text-blue-400"
                                title="NSE & BSE"
                                description="India's premier exchanges where billions in capital change hands daily."
                            />
                            <BriefingCard 
                                icon={Clock}
                                color="text-yellow-400"
                                title="Market Hours"
                                description="Pre-open: 9:00 AM. Trading: 9:15 AM - 3:30 PM IST. Monday to Friday."
                            />
                            <BriefingCard 
                                icon={Activity}
                                color="text-red-400"
                                title="Volatility"
                                description="Risk and Reward go hand in hand. Higher volatility means bigger swings."
                            />
                        </div>

                        {/* Live Ticker Strip */}
                        <div className="w-full max-w-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-full h-12 flex items-center px-6 mb-10 overflow-hidden relative group">
                            <div className="absolute left-6 flex items-center gap-2 z-10 bg-slate-900/40 pr-4 rounded-r-xl backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live</span>
                            </div>
                            
                            <div className="flex items-center gap-8 animate-[scroll_20s_linear_infinite] pl-20 group-hover:pause">
                                {[...INDIAN_INDICES, ...INDIAN_INDICES].map((idx, i) => (
                                    <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-xs font-bold text-slate-400">{idx.name}</span>
                                        <span className={`text-xs font-mono font-medium ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {idx.value.toLocaleString()}
                                        </span>
                                        <span className={`text-[10px] ${idx.change >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                                            {idx.change > 0 ? '▲' : '▼'} {Math.abs(idx.percentChange)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                             {/* Gradient masks for ticker */}
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
                        </div>

                        {/* CTA */}
                        <button 
                            onClick={() => setView('login')}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                        >
                            Login to Trade
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {/* --- View 2: Authentication --- */}
                {view === 'login' && (
                    <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
                        <button 
                            onClick={() => setView('briefing')}
                            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Market Brief
                        </button>

                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            {/* Glow effect inside card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                                <p className="text-slate-400 text-sm">Authenticate to access your terminal.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FloatingInput 
                                    label="Email Address" 
                                    type="email" 
                                    value={email}
                                    onChange={setEmail}
                                    icon={Mail}
                                />
                                <FloatingInput 
                                    label="Password" 
                                    type="password" 
                                    value={password}
                                    onChange={setPassword}
                                    icon={Lock}
                                />

                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200 transition-colors">
                                        <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-0 focus:ring-offset-0" />
                                        Keep me logged in
                                    </label>
                                    <a href="#" className="hover:text-blue-400 transition-colors">Forgot Password?</a>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <ShieldCheck size={18} className="text-blue-200 group-hover:text-white transition-colors" />
                                            Secure Login
                                        </>
                                    )}
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-3"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                    Sign in with Google
                                </button>
                            </form>
                            
                            <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-4">
                                <p className="text-slate-500 text-xs">
                                    Protected by 256-bit SSL encryption. <br/>
                                    Unauthorized access is prohibited.
                                </p>
                                <div className="pt-2">
                                    <button 
                                        onClick={() => window.location.hash = 'admin-login'}
                                        className="text-[10px] text-slate-600 hover:text-red-500/80 uppercase tracking-[0.2em] font-bold transition-colors"
                                    >
                                        Administrative Access
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-components ---

const BriefingCard = ({ icon: Icon, color, title, description }: { icon: any, color: string, title: string, description: string }) => (
    <div className="group bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 p-5 rounded-2xl hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 cursor-default">
        <div className={`w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${color}`}>
            <Icon size={20} />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-light">{description}</p>
    </div>
);

const FloatingInput = ({ label, type, value, onChange, icon: Icon }: { label: string, type: string, value: string, onChange: (v: string) => void, icon: any }) => {
    const [focused, setFocused] = useState(false);
    
    return (
        <div className="relative group">
            <div className={`absolute left-3.5 top-3.5 transition-colors duration-300 ${focused ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                <Icon size={18} />
            </div>
            <input 
                type={type} 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="peer w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-transparent"
                placeholder={label}
                required
            />
            <label className={`
                absolute left-10 transition-all duration-200 pointer-events-none
                ${focused || value ? 'top-[-10px] text-[10px] bg-slate-900 px-1 text-blue-400 font-bold uppercase tracking-wider' : 'top-3.5 text-sm text-slate-500'}
            `}>
                {label}
            </label>
        </div>
    );
};

export default LoginPage;
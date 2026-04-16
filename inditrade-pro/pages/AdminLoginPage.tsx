import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, Lock, Mail, ArrowLeft, ShieldCheck, Terminal
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AdminLoginPageProps {
    onLogin: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Check hardcoded demo admin credentials first to satisfy the requirement
            // and avoid Firebase errors if Email/Password auth is not enabled in the console.
            if (email === 'admin@gmail.com' && password === '12345678') {
                onLogin();
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if user has admin role in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                onLogin();
            } else {
                await auth.signOut();
                setError('Access denied. You do not have administrative privileges.');
            }
        } catch (err: any) {
            console.error("Admin Login Error", err);
            if (err.code === 'auth/operation-not-allowed') {
                setError('Email/Password login is not enabled in Firebase. Please use the default demo credentials (admin@gmail.com / 12345678) or enable it in the Firebase Console.');
            } else {
                setError(err.message || 'Invalid administrative credentials. Access denied.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        window.location.hash = '';
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-red-500/30">
            {/* --- Background Ambient Effects --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/5 blur-[100px] animate-pulse duration-[4s]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px] animate-pulse duration-[5s] delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
            </div>

            {/* --- Main Container --- */}
            <div className={`relative z-10 w-full max-w-md mx-auto px-4 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                
                <button 
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </button>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Glow effect inside card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                            <ShieldAlert size={24} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
                        <p className="text-slate-400 text-sm">Restricted Area. Authorized Personnel Only.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-200 leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-red-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                                placeholder="Admin Email"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-red-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Terminal size={18} className="text-red-200 group-hover:text-white transition-colors" />
                                    Initialize Admin Session
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            Security Level: Alpha-9
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;

import React, { useState, useEffect } from 'react';
import { 
    Settings, Shield, Bell, Globe, Database, 
    Lock, Eye, EyeOff, Save, RefreshCw, 
    Zap, Cpu, Server, HardDrive, AlertTriangle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Configurations: React.FC = () => {
    const [showKey, setShowKey] = useState(false);
    const [maxQuantity, setMaxQuantity] = useState<number>(1000);
    const [maxOrderValue, setMaxOrderValue] = useState<number>(1000000);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'trading_limits');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.maxQuantity) setMaxQuantity(data.maxQuantity);
                    if (data.maxOrderValue) setMaxOrderValue(data.maxOrderValue);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await setDoc(doc(db, 'settings', 'trading_limits'), {
                maxQuantity,
                maxOrderValue,
                updatedAt: new Date()
            }, { merge: true });
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'settings/trading_limits');
            setSaveMessage('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* General Settings */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Settings size={20} />
                    </div>
                    <h3 className="font-bold text-lg">General Platform Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ConfigToggle 
                        label="Maintenance Mode" 
                        description="Disable all user trading and show maintenance screen." 
                        enabled={false} 
                    />
                    <ConfigToggle 
                        label="Public Registration" 
                        description="Allow new users to sign up without invitation." 
                        enabled={true} 
                    />
                    <ConfigToggle 
                        label="AI Market Analysis" 
                        description="Enable Gemini-powered insights for all users." 
                        enabled={true} 
                    />
                    <ConfigToggle 
                        label="Real-time Notifications" 
                        description="Push price alerts and system updates to clients." 
                        enabled={true} 
                    />
                </div>
            </section>

            {/* Trading Limits Configuration */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Trading Limits (Applied to User Dashboard)</h3>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Order Quantity</label>
                            <input 
                                type="number" 
                                value={maxQuantity}
                                onChange={(e) => setMaxQuantity(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                            />
                            <p className="text-[10px] text-slate-500">Maximum shares allowed per single order.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Order Value (₹)</label>
                            <input 
                                type="number" 
                                value={maxOrderValue}
                                onChange={(e) => setMaxOrderValue(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                            />
                            <p className="text-[10px] text-slate-500">Maximum total value (Price × Qty) per order.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* API & Security */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <Shield size={20} />
                    </div>
                    <h3 className="font-bold text-lg">API & Security Configuration</h3>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gemini API Key</label>
                        <div className="relative">
                            <input 
                                type={showKey ? 'text' : 'password'} 
                                value="AIzaSyB_REDACTED_KEY_4582930" 
                                readOnly
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm font-mono text-slate-300"
                            />
                            <button 
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rate Limit (req/min)</label>
                            <input 
                                type="number" 
                                defaultValue={60} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Session Timeout (mins)</label>
                            <input 
                                type="number" 
                                defaultValue={30} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500/50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure Advancement */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <Zap size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Infrastructure Scaling</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ResourceCard icon={Cpu} label="Compute Nodes" value="4 Active" sub="Auto-scaling: ON" />
                    <ResourceCard icon={HardDrive} label="Storage Cluster" value="1.2 TB" sub="Usage: 45%" />
                    <ResourceCard icon={Server} label="Load Balancers" value="2 Active" sub="Region: Mumbai" />
                </div>
            </section>

            {/* Save Actions */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-800">
                {saveMessage && <span className="text-sm font-bold text-green-500">{saveMessage}</span>}
                <button className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Discard Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

const ConfigToggle = ({ label, description, enabled }: { label: string, description: string, enabled: boolean }) => {
    const [isOn, setIsOn] = useState(enabled);
    return (
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start justify-between gap-4">
            <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{label}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{description}</p>
            </div>
            <button 
                onClick={() => setIsOn(!isOn)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 shrink-0 ${isOn ? 'bg-red-600' : 'bg-slate-800'}`}
            >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isOn ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
    );
};

const ResourceCard = ({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) => (
    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all group">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 group-hover:text-purple-500 transition-colors">
                <Icon size={18} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <h4 className="text-xl font-bold text-white mb-1">{value}</h4>
        <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
);

export default Configurations;

import React, { useState, useEffect } from 'react';
import { 
    Users, UserPlus, Search, Filter, MoreVertical, 
    Shield, Mail, Calendar, Activity, CheckCircle2, 
    XCircle, Clock, MapPin, Smartphone
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'pro';
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: string;
    location: string;
    device: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    useEffect(() => {
        // If not authenticated with Firebase (e.g., used hardcoded demo credentials), use mock data
        if (!auth.currentUser) {
            const defaultUsers: User[] = [
                { id: '1', name: 'Karan Sai', email: 'karansai2005@gmail.com', role: 'admin', status: 'Active', lastLogin: 'Just now', location: 'Mumbai, IN', device: 'MacBook Pro' },
                { id: '2', name: 'Rahul Sharma', email: 'rahul.s@example.com', role: 'pro', status: 'Active', lastLogin: '2 hours ago', location: 'Delhi, IN', device: 'iPhone 15' },
                { id: '3', name: 'Priya Patel', email: 'priya.p@example.com', role: 'user', status: 'Inactive', lastLogin: '3 days ago', location: 'Bangalore, IN', device: 'Windows PC' },
                { id: '4', name: 'Amit Singh', email: 'amit.v@example.com', role: 'user', status: 'Active', lastLogin: '5 mins ago', location: 'Pune, IN', device: 'Android' },
                { id: '5', name: 'Sneha Gupta', email: 'sneha.g@example.com', role: 'pro', status: 'Pending', lastLogin: 'Never', location: 'Kolkata, IN', device: 'iPad Air' },
            ];
            setUsers(defaultUsers);
            return;
        }

        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.displayName || 'Anonymous',
                    email: data.email || 'N/A',
                    role: data.role || 'user',
                    status: 'Active',
                    lastLogin: data.lastLogin?.toDate().toLocaleString() || 'Never',
                    location: 'Remote',
                    device: 'Web Browser'
                } as User;
            });
            setUsers(usersData);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'users');
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role.toLowerCase() === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === 'All' || user.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-red-500/50"
                    >
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Pro">Pro</option>
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-red-500/50"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20">
                        <UserPlus size={16} />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Last Activity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Device/Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            user.role === 'Admin' ? 'bg-red-500/10 text-red-500' : 
                                            user.role === 'Pro' ? 'bg-purple-500/10 text-purple-500' : 
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            <Shield size={10} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                            user.status === 'Active' ? 'text-green-500' : 
                                            user.status === 'Inactive' ? 'text-slate-500' : 
                                            'text-yellow-500'
                                        }`}>
                                            {user.status === 'Active' ? <CheckCircle2 size={14} /> : 
                                             user.status === 'Inactive' ? <XCircle size={14} /> : 
                                             <Clock size={14} />}
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                <Activity size={12} className="text-slate-500" />
                                                {user.lastLogin}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <MapPin size={10} />
                                                {user.location}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <Smartphone size={10} />
                                                {user.device}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users size={48} className="mx-auto text-slate-800 mb-4" />
                        <p className="text-slate-500">No users found matching your search.</p>
                    </div>
                )}
            </div>
            
            {/* Advancement: User Activity Heatmap */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">User Activity Heatmap</h3>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-slate-800"></div>
                            Low
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-red-900"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-red-700"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                            High
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-12 rounded-lg border border-slate-800/50 transition-all hover:scale-105 cursor-pointer ${
                                i % 5 === 0 ? 'bg-red-500/40' : 
                                i % 3 === 0 ? 'bg-red-700/30' : 
                                i % 2 === 0 ? 'bg-red-900/20' : 'bg-slate-800/20'
                            }`}
                        ></div>
                    ))}
                </div>
                <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

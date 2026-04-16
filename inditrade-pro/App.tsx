import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [currentHash, setCurrentHash] = useState(window.location.hash);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkHash = () => {
            const hash = window.location.hash;
            setCurrentHash(hash);
        };
        
        window.addEventListener('hashchange', checkHash);
        checkHash();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const role = userDoc.exists() ? userDoc.data().role : 'user';
                
                if (role === 'admin') {
                    setIsAdminAuthenticated(true);
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                    setIsAdminAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
                setIsAdminAuthenticated(false);
            }
            setIsLoading(false);
        });

        return () => {
            window.removeEventListener('hashchange', checkHash);
            unsubscribe();
        };
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleLogin = () => {
        setIsAuthenticated(true);
        window.location.hash = 'dashboard';
    };

    const handleAdminLogin = () => {
        setIsAdminAuthenticated(true);
        window.location.hash = 'admin-dashboard';
    };

    // Routing logic
    if (currentHash === '#admin-login') {
        return <AdminLoginPage onLogin={handleAdminLogin} />;
    }

    if (currentHash === '#admin-dashboard') {
        return isAdminAuthenticated ? <AdminDashboardPage /> : <AdminLoginPage onLogin={handleAdminLogin} />;
    }

    if (isAuthenticated || isAdminAuthenticated) {
        return isAdminAuthenticated ? <AdminDashboardPage /> : <DashboardPage />;
    }

    return <LoginPage onLogin={handleLogin} />;
};

export default App;

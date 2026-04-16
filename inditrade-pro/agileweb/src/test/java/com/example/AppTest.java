
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

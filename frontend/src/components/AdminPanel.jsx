import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Activity, 
    Eye, 
    TrendingUp, 
    LogOut, 
    Lock, 
    User, 
    Shield, 
    AlertCircle, 
    Calendar, 
    ArrowLeft,
    Search
} from 'lucide-react';
import { api } from '../services/api';

const AdminPanel = () => {
    const navigate = useNavigate();
    
    // Auth States
    const [isAdmin, setIsAdmin] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    // Stats States
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');

    // Check existing session
    useEffect(() => {
        const token = localStorage.getItem('db_token');
        const userStr = localStorage.getItem('db_user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'admin') {
                    setIsAdmin(true);
                    fetchAdminStats();
                } else {
                    setIsAdmin(false);
                }
            } catch (e) {
                clearSession();
            }
        }
    }, []);

    const clearSession = () => {
        localStorage.removeItem('db_token');
        localStorage.removeItem('db_user');
        setIsAdmin(false);
    };

    const fetchAdminStats = async () => {
        setStatsLoading(true);
        setStatsError('');
        try {
            const res = await api.getAdminStats();
            if (res.data && res.data.status === 'success') {
                setStats(res.data);
            } else {
                setStatsError(res.data.error || 'Failed to fetch admin statistics');
            }
        } catch (err) {
            setStatsError(err.response?.data?.error || 'Failed to connect to the server');
            if (err.response?.status === 403) {
                clearSession();
            }
        } finally {
            setStatsLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!usernameInput || !passwordInput) {
            setLoginError('Please fill in all fields');
            return;
        }
        
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await api.login(usernameInput, passwordInput);
            if (res.data.status === 'success') {
                const user = res.data.user;
                if (user && user.role === 'admin') {
                    localStorage.setItem('db_token', res.data.token);
                    localStorage.setItem('db_user', JSON.stringify(user));
                    setIsAdmin(true);
                    setUsernameInput('');
                    setPasswordInput('');
                    // Fetch stats immediately
                    fetchAdminStats();
                } else {
                    setLoginError('Access denied: Insufficient permissions.');
                }
            } else {
                setLoginError(res.data.message || 'Invalid username or password');
            }
        } catch (err) {
            setLoginError('Server connection error. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        clearSession();
        navigate('/');
    };

    // Filter registered users based on search query
    const filteredUsers = stats?.users?.filter(user => {
        const query = userSearchQuery.toLowerCase();
        return (
            (user.username || '').toLowerCase().includes(query) ||
            (user.name || '').toLowerCase().includes(query) ||
            (user.role || '').toLowerCase().includes(query)
        );
    }) || [];

    // Formatter helpers
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return isoString;
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    if (!isAdmin) {
        return (
            <div style={styles.loginScreen}>
                {/* Visual Ambient Glow */}
                <div style={styles.glowBg1}></div>
                <div style={styles.glowBg2}></div>
                
                <div style={styles.loginCard} className="glass">
                    <div style={styles.loginHeader}>
                        <div style={styles.loginBadge}>
                            <Shield size={18} style={{ color: '#d97706' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', letterSpacing: '0.05em' }}>SECURED CONTROL</span>
                        </div>
                        <h1 style={styles.loginTitle}>DB Advisory</h1>
                        <p style={styles.loginSubtitle}>ADMIN CONTROL PORTAL</p>
                    </div>

                    {loginError && (
                        <div style={styles.errorAlert}>
                            <AlertCircle size={16} />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Admin Username</label>
                            <div style={styles.inputContainer}>
                                <User size={16} style={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    style={styles.darkInput}
                                    disabled={loginLoading}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Access Password</label>
                            <div style={styles.inputContainer}>
                                <Lock size={16} style={styles.inputIcon} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    style={styles.darkInput}
                                    disabled={loginLoading}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={styles.loginButton} 
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Verifying Credentials...' : 'Authenticate & Open Dashboard'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button 
                            onClick={() => navigate('/')} 
                            style={styles.backButtonLink}
                        >
                            <ArrowLeft size={14} /> Back to Advisory Landing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.adminLayout}>
            {/* Top Bar Navigation */}
            <header style={styles.adminHeader}>
                <div style={styles.brand}>
                    <Shield size={24} style={{ color: '#d97706' }} />
                    <h2 style={styles.brandTitle}>DB Advisory <span>Admin Panel</span></h2>
                </div>
                <div style={styles.headerActions}>
                    <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
                        <ArrowLeft size={16} /> Deal Room
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={styles.adminMain}>
                {statsError && (
                    <div style={styles.dashboardError}>
                        <AlertCircle size={20} />
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>System Sync Failed</strong>
                            <span>{statsError}</span>
                        </div>
                        <button onClick={fetchAdminStats} style={styles.retryButton}>Retry Connection</button>
                    </div>
                )}

                {/* Header overview */}
                <div style={styles.pageOverview}>
                    <div>
                        <h1 style={styles.pageTitle}>System Telemetry & Auditing</h1>
                        <p style={styles.pageSubtitle}>Real-time system usage, visitor counts, registered users, and operations log.</p>
                    </div>
                    <button 
                        onClick={fetchAdminStats} 
                        style={styles.refreshButton}
                        disabled={statsLoading}
                    >
                        {statsLoading ? 'Syncing System...' : 'Sync Live Telemetry'}
                    </button>
                </div>

                {/* Metrics Cards Grid */}
                <div style={styles.metricsGrid}>
                    {/* Visitor Card */}
                    <div style={{...styles.metricCard, borderLeft: '4px solid #3b82f6'}} className="glass">
                        <div style={styles.metricHeader}>
                            <span style={styles.metricLabel}>DAILY UNIQUE VISITORS</span>
                            <div style={{...styles.metricIconContainer, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
                                <Eye size={18} />
                            </div>
                        </div>
                        <h3 style={styles.metricValue}>
                            {statsLoading && !stats ? '...' : (stats?.metrics?.total_unique_visitors || 0).toLocaleString()}
                        </h3>
                        <span style={styles.metricDetail}>Unique client IPs across tracking dates</span>
                    </div>

                    {/* Total Visits Card */}
                    <div style={{...styles.metricCard, borderLeft: '4px solid #10b981'}} className="glass">
                        <div style={styles.metricHeader}>
                            <span style={styles.metricLabel}>TOTAL SITE TRAFFIC</span>
                            <div style={{...styles.metricIconContainer, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <h3 style={styles.metricValue}>
                            {statsLoading && !stats ? '...' : (stats?.metrics?.total_visits || 0).toLocaleString()}
                        </h3>
                        <span style={styles.metricDetail}>Aggregated client page-load events</span>
                    </div>

                    {/* Users Card */}
                    <div style={{...styles.metricCard, borderLeft: '4px solid #d97706'}} className="glass">
                        <div style={styles.metricHeader}>
                            <span style={styles.metricLabel}>REGISTERED CLIENTS</span>
                            <div style={{...styles.metricIconContainer, backgroundColor: 'rgba(217, 119, 6, 0.1)', color: '#d97706'}}>
                                <Users size={18} />
                            </div>
                        </div>
                        <h3 style={styles.metricValue}>
                            {statsLoading && !stats ? '...' : (stats?.metrics?.total_users || 0).toLocaleString()}
                        </h3>
                        <span style={styles.metricDetail}>Registered system credentials</span>
                    </div>

                    {/* Deals Card */}
                    <div style={{...styles.metricCard, borderLeft: '4px solid #8b5cf6'}} className="glass">
                        <div style={styles.metricHeader}>
                            <span style={styles.metricLabel}>DEALS ANALYZED</span>
                            <div style={{...styles.metricIconContainer, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6'}}>
                                <Activity size={18} />
                            </div>
                        </div>
                        <h3 style={styles.metricValue}>
                            {statsLoading && !stats ? '...' : (stats?.metrics?.total_deals || 0).toLocaleString()}
                        </h3>
                        <span style={styles.metricDetail}>AI valuation algorithms completed</span>
                    </div>
                </div>

                {/* Sub-grid: Users and Activity feed */}
                <div style={styles.dashboardGrid}>
                    {/* User Management table */}
                    <div style={styles.gridColumnLeft} className="glass">
                        <div style={styles.gridSectionHeader}>
                            <div>
                                <h4 style={styles.gridSectionTitle}>Registered Client Base</h4>
                                <p style={styles.gridSectionSubtitle}>Manage credentialed profiles and view individual search activity logs.</p>
                            </div>
                            <div style={styles.searchContainer}>
                                <Search size={14} style={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    style={styles.searchBar}
                                />
                            </div>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.adminTable}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>CLIENT USERNAME</th>
                                        <th style={styles.th}>NAME</th>
                                        <th style={styles.th}>SECURITY ROLE</th>
                                        <th style={styles.th}>ENROLLMENT DATE</th>
                                        <th style={styles.th}>SEARCHES RUN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statsLoading && !stats ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                                Syncing clients...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                                No users found matching query
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, idx) => (
                                            <tr key={idx} style={styles.trHover}>
                                                <td style={styles.tdUsername}>{user.username}</td>
                                                <td style={styles.tdName}>{user.name || 'Anonymous Client'}</td>
                                                <td style={styles.td}>
                                                    <span style={
                                                        user.role === 'admin' 
                                                            ? styles.roleBadgeAdmin 
                                                            : styles.roleBadgeUser
                                                    }>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td style={styles.tdDate}>{formatDate(user.created_at)}</td>
                                                <td style={styles.tdSearches}>{user.searches_count || 0}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Operations Log feed */}
                    <div style={styles.gridColumnRight} className="glass">
                        <div style={styles.gridSectionHeader}>
                            <div>
                                <h4 style={styles.gridSectionTitle}>Recent Operations Feed</h4>
                                <p style={styles.gridSectionSubtitle}>Chronological audit log of client requests and valuations processed.</p>
                            </div>
                        </div>

                        <div style={styles.activityFeed}>
                            {statsLoading && !stats ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                    Syncing logs...
                                </div>
                            ) : !stats?.recent_deals || stats.recent_deals.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                    No records logged. Run valuations to populate this feed.
                                </div>
                            ) : (
                                stats.recent_deals.map((deal, idx) => (
                                    <div key={idx} style={styles.activityItem}>
                                        <div style={styles.activityDot}></div>
                                        <div style={styles.activityContent}>
                                            <div style={styles.activityMainRow}>
                                                <strong style={styles.activityCompany}>{deal.company}</strong>
                                                <span style={styles.activityTypeBadge}>{deal.deal_type}</span>
                                            </div>
                                            <div style={styles.activityMetaRow}>
                                                <span style={styles.activityUser}>by <strong>{deal.username}</strong></span>
                                                <span style={styles.activityTime}>
                                                    <Calendar size={10} style={{ marginRight: '4px' }} />
                                                    {formatDate(deal.timestamp)} @ {formatTime(deal.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Styling Object - High Fidelity Dark Mode Glassmorphism Theme
const styles = {
    loginScreen: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(ellipse at center, #0f1c3f 0%, #060913 70%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
    },
    glowBg1: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '10%',
        left: '20%',
        pointerEvents: 'none',
    },
    glowBg2: {
        position: 'absolute',
        width: '350px',
        height: '350px',
        backgroundColor: 'rgba(0, 82, 204, 0.05)',
        filter: 'blur(90px)',
        borderRadius: '50%',
        bottom: '15%',
        right: '25%',
        pointerEvents: 'none',
    },
    loginCard: {
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(10, 17, 34, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        zIndex: 10,
    },
    loginHeader: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    loginBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        borderRadius: '20px',
        marginBottom: '16px',
    },
    loginTitle: {
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: '36px',
        fontWeight: 600,
        color: '#ffffff',
        marginBottom: '4px',
        letterSpacing: '-0.02em',
    },
    loginSubtitle: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#94a3b8',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    inputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#475569',
    },
    darkInput: {
        width: '100%',
        background: '#070a13',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#f8fafc',
        padding: '12px 16px 12px 44px',
        borderRadius: '8px',
        fontSize: '15px',
        transition: 'all 0.3s ease',
        outline: 'none',
    },
    errorAlert: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '14px',
        marginBottom: '24px',
    },
    loginButton: {
        marginTop: '10px',
        padding: '14px',
        background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
        transition: 'all 0.3s ease',
    },
    backButtonLink: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'color 0.2s',
    },
    
    // Admin Dashboard View
    adminLayout: {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#070a13',
        color: '#cbd5e1',
        display: 'flex',
        flexDirection: 'column',
    },
    adminHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: '#0a0f20',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    brandTitle: {
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: '22px',
        fontWeight: 600,
        color: '#ffffff',
    },
    headerActions: {
        display: 'flex',
        gap: '12px',
    },
    secondaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#e2e8f0',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    logoutButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    adminMain: {
        flex: 1,
        padding: '40px',
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
    },
    dashboardError: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        color: '#ef4444',
        marginBottom: '32px',
    },
    retryButton: {
        marginLeft: 'auto',
        padding: '6px 14px',
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    pageOverview: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
    },
    pageTitle: {
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: '32px',
        fontWeight: 600,
        color: '#ffffff',
        marginBottom: '6px',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: '#64748b',
    },
    refreshButton: {
        padding: '10px 20px',
        background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    
    // Metrics Grid
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
    },
    metricCard: {
        background: 'rgba(10, 17, 34, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    metricHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
    },
    metricLabel: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: '0.1em',
    },
    metricIconContainer: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '32px',
        fontWeight: 700,
        color: '#ffffff',
        marginBottom: '4px',
    },
    metricDetail: {
        fontSize: '12px',
        color: '#475569',
    },

    // Sub-grid Layout
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '32px',
        alignItems: 'start',
    },
    gridColumnLeft: {
        background: 'rgba(10, 17, 34, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    gridColumnRight: {
        background: 'rgba(10, 17, 34, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    gridSectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    gridSectionTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#ffffff',
        marginBottom: '4px',
    },
    gridSectionSubtitle: {
        fontSize: '13px',
        color: '#64748b',
    },
    searchContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        color: '#475569',
    },
    searchBar: {
        background: '#070a13',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#cbd5e1',
        padding: '8px 12px 8px 34px',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        width: '200px',
        transition: 'all 0.3s ease',
    },

    // User Table
    tableContainer: {
        overflowX: 'auto',
        width: '100%',
    },
    adminTable: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        verticalAlign: 'middle',
    },
    tdUsername: {
        padding: '16px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#ffffff',
        fontFamily: "'JetBrains Mono', monospace",
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        verticalAlign: 'middle',
    },
    tdName: {
        padding: '16px',
        fontSize: '14px',
        color: '#cbd5e1',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        verticalAlign: 'middle',
    },
    tdDate: {
        padding: '16px',
        fontSize: '13px',
        color: '#64748b',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        verticalAlign: 'middle',
    },
    tdSearches: {
        padding: '16px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#d97706',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        textAlign: 'right',
        verticalAlign: 'middle',
    },
    trHover: {
        transition: 'background-color 0.2s',
        borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    },
    roleBadgeAdmin: {
        display: 'inline-block',
        padding: '2px 8px',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        color: '#d97706',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    roleBadgeUser: {
        display: 'inline-block',
        padding: '2px 8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        color: '#3b82f6',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
    },

    // Operations Log Feed
    activityFeed: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxHeight: '450px',
        overflowY: 'auto',
        paddingRight: '6px',
    },
    activityItem: {
        display: 'flex',
        gap: '16px',
        position: 'relative',
    },
    activityDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#d97706',
        marginTop: '6px',
        boxShadow: '0 0 8px #d97706',
        flexShrink: 0,
    },
    activityContent: {
        flex: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        paddingBottom: '12px',
    },
    activityMainRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    activityCompany: {
        fontSize: '14px',
        color: '#ffffff',
    },
    activityTypeBadge: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        padding: '1px 6px',
        borderRadius: '4px',
    },
    activityMetaRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#64748b',
    },
    activityUser: {
        color: '#64748b',
    },
    activityTime: {
        display: 'flex',
        alignItems: 'center',
        color: '#475569',
    }
};

// Add responsive / hover CSS rule behaviors via script insertion
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .glass {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass:hover {
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
            border-color: rgba(255, 255, 255, 0.09) !important;
        }
        tr:hover {
            background-color: rgba(255, 255, 255, 0.02);
        }
        @media (max-width: 1024px) {
            div[style*="gridTemplateColumns"] {
                grid-template-columns: 1fr !important;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

export default AdminPanel;

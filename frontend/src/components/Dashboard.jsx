import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart4, LayoutDashboard, History, CreditCard,
    FileText, Zap, TrendingUp, Download, RefreshCw,
    Globe, Shield
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [view, setView] = useState('analyzer');
    const [authMode, setAuthMode] = useState('signin');

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Analyzer State
    const [company, setCompany] = useState('');
    const [dealType, setDealType] = useState('M&A');
    const [loading, setLoading] = useState(false);
    const [latestData, setLatestData] = useState(null);

    // History State
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Restore last analysis data
        const savedAnalysis = localStorage.getItem('latest_analysis');
        if (savedAnalysis) {
            setLatestData(JSON.parse(savedAnalysis));
        }
    }, []);

    // Persist analysis data whenever it changes
    useEffect(() => {
        if (latestData) {
            localStorage.setItem('latest_analysis', JSON.stringify(latestData));
        }
    }, [latestData]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                const userData = {
                    username: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    isGoogle: true
                };

                // Save user to MongoDB backend
                await api.googleLogin(userData.username, userData.name);

                localStorage.setItem('db_user', JSON.stringify(userData));
                setUser(userData);
            } catch (err) {
                console.error("Google Auth Error:", err);
                alert("Failed to get user info from Google");
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            alert("Google Sign-In failed. Please try again.");
        }
    });

    const handleLogin = async () => {
        setError('Authenticating...');
        try {
            const res = await api.login(email, password);
            if (res.data.status === 'success') {
                const userData = { username: email };
                localStorage.setItem('userSession', JSON.stringify(userData));
                setUser(userData);
                setError('');
            } else {
                setError('Invalid credentials');
            }
        } catch (e) {
            setError('Error connecting to server');
        }
    };

    const handleSignup = async () => {
        setError('Creating account...');
        try {
            const res = await api.signup(email, password);
            if (res.data.status === 'success') {
                const userData = { username: email };
                localStorage.setItem('userSession', JSON.stringify(userData));
                setUser(userData);
                setError('');
            } else {
                setError(res.data.message || 'Signup failed');
            }
        } catch (e) {
            setError('Error connecting to server');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        localStorage.removeItem('latest_analysis');
        setUser(null);
        navigate('/');
    };

    const handleCardClick = (type) => {
        if (!latestData) return;
        navigate(`/detail/${type}`, { state: { data: latestData } });
    };

    const handleAnalyze = async () => {
        if (!company) return;
        setLoading(true);
        setLatestData(null);
        try {
            const res = await api.analyze(company, dealType);
            setLatestData(res.data);
            setLoading(false);
        } catch (e) {
            alert("Analysis failed. Backend might be down.");
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const res = await api.getHistory();
            setSearchHistory(res.data);
        } catch (e) {
            console.error("Failed to load history");
        }
    };

    useEffect(() => {
        if (view === 'history') loadHistory();
    }, [view]);

    const handleDownload = async () => {
        if (!latestData) return;
        try {
            const res = await api.downloadPpt(latestData);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${latestData.company}_Pitchbook.pptx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            alert("Download failed");
        }
    };

    if (!user) {
        return (
            <div id="login-screen" >
                <div className="login-container">
                    <h1 className="login-brand" style={{ textAlign: 'center' }}>DB Advisory & Research</h1>
                    <div className="auth-card glass" style={{ padding: '30px 50px 40px 40px' }}>
                        <h2 className="auth-title" style={{ textAlign: 'center' }}>{authMode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
                        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
                            {authMode === 'signin' ? 'Sign in to your dashboard.' : 'Start analyzing deals in seconds.'}
                        </p>

                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Username@gmail.com"
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button className="btn btn-primary full-width" style={{ marginTop: '20px', padding: '10px' }} onClick={authMode === 'signin' ? handleLogin : handleSignup}>
                            {authMode === 'signin' ? 'Sign in' : 'Sign up'}
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button className="btn btn-google full-width" onClick={() => googleLogin()}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
                            Sign in with Google
                        </button>

                        <p className="auth-footer">
                            {authMode === 'signin' ? (
                                <>Don't have an account? <a onClick={() => setAuthMode('signup')}>Sign up</a></>
                            ) : (
                                <>Already have an account? <a onClick={() => setAuthMode('signin')}>Sign in</a></>
                            )}
                        </p>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a onClick={() => navigate('/pricing')}>Pricing</a>
                    <a onClick={() => navigate('/contact')}>Contact</a>
                </nav>
                <div className="header-actions">
                    <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                </div>
            </header>

            <div className="db-layout" style={{ flex: 1, overflow: 'hidden' }}>
                <aside className="db-sidebar glass">
                    <nav className="sidebar-nav">
                        <a className={`nav-item ${view === 'analyzer' ? 'active' : ''}`} onClick={() => setView('analyzer')}>
                            <LayoutDashboard size={20} /> Deal Analyzer
                        </a>
                        <a className={`nav-item ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
                            <History size={20} /> History
                        </a>
                        <a className="nav-item" onClick={() => navigate('/pricing')}>
                            <CreditCard size={20} /> Pricing
                        </a>
                    </nav>
                    <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Logged in as <strong>{user.username}</strong></p>
                        <button className="btn btn-secondary full-width" style={{ marginTop: '10px' }} onClick={handleSignOut}>Sign Out</button>
                    </div>
                </aside>

                <main className="db-main">
                    {view === 'analyzer' && (
                        <div className="dashboard-body">
                            <div className="input-panel glass">
                                <h3>Analyze a Deal</h3>
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Company Ticker / Name</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="e.g. Goldman Sachs or GS"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Deal Type</label>
                                        <select value={dealType} onChange={(e) => setDealType(e.target.value)}>
                                            <option value="M&A">M&A</option>
                                            <option value="IPO">IPO</option>
                                            <option value="LBO">LBO</option>
                                            <option value="Restructuring">Restructuring</option>
                                        </select>
                                    </div>
                                    <button className="btn btn-primary" onClick={handleAnalyze}>
                                        <Zap size={18} /> Generate Intelligence
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div id="loading">
                                    <div className="spinner"></div>
                                    <p>AI synthesizing deal structure, live market comps, and IB matrices...</p>
                                </div>
                            )}

                            {latestData && (
                                <div id="results-panel">
                                    <div className="actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                        <h2 id="deal-title">{latestData.company} - {latestData.deal_type} Analysis</h2>
                                        <button className="btn btn-secondary" onClick={handleDownload}>
                                            <Download size={18} /> Export Pitchbook (.pptx)
                                        </button>
                                    </div>

                                    <div className="results-grid">
                                        <div className="card glass clickable-card" onClick={() => handleCardClick('overview')}>
                                            <h4><FileText size={18} /> Deal Overview</h4>
                                            <p>{latestData.analysis.overview}</p>
                                        </div>
                                        <div className="card glass clickable-card" onClick={() => handleCardClick('industry')}>
                                            <h4><Globe size={18} /> Industry Landscape</h4>
                                            <p>{latestData.analysis.industry}</p>
                                        </div>
                                        <div className="card glass full-width" style={{ borderLeft: '4px solid var(--primary)' }}>
                                            <h4><TrendingUp size={18} /> Financial Snapshot</h4>
                                            <p style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '500' }}>{latestData.analysis.figures}</p>
                                        </div>
                                        <div className="card glass clickable-card" onClick={() => handleCardClick('rationale')}>
                                            <h4><TrendingUp size={18} /> Investment Rationale</h4>
                                            <p>{latestData.analysis.rationale}</p>
                                        </div>
                                        <div className="card glass clickable-card" onClick={() => handleCardClick('risks')}>
                                            <h4><Shield size={18} /> Key Risks</h4>
                                            <p>{latestData.analysis.risks}</p>
                                        </div>

                                        {latestData.history_data && latestData.history_data.length > 0 && (
                                            <div className="card glass full-width">
                                                <h4><BarChart4 size={18} /> Visual Intelligence: LTM Price Performance</h4>
                                                <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={latestData.history_data}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                                            <Tooltip
                                                                contentStyle={{ background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '8px' }}
                                                                itemStyle={{ color: 'var(--primary)' }}
                                                            />
                                                            <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}

                                        {latestData.benchmarking_data && latestData.benchmarking_data.length > 0 && (
                                            <div className="card glass full-width">
                                                <h4><TrendingUp size={18} /> Multiples Benchmarking (P/E Ratio)</h4>
                                                <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={latestData.benchmarking_data}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                            <Tooltip
                                                                contentStyle={{ background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '8px' }}
                                                                itemStyle={{ color: 'var(--primary)' }}
                                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                            />
                                                            <Bar dataKey="pe_ratio" radius={[4, 4, 0, 0]}>
                                                                {latestData.benchmarking_data.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'var(--border-strong)'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                                                    Gold bar indicates Target Company ({latestData.company})
                                                </p>
                                            </div>
                                        )}

                                        {latestData.banks && latestData.banks.length > 0 && (
                                            <div className="card glass full-width">
                                                <h4><TrendingUp size={18} /> IB Bank Matrix (Probability Engine)</h4>
                                                <div className="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr><th>Bank</th><th>ECM Score</th><th>Probability</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {latestData.banks.map((b, i) => (
                                                                <tr key={i}>
                                                                    <td>{b.bank}</td>
                                                                    <td>{b.score}</td>
                                                                    <td style={{ color: b.probability === 'High' ? '#10b981' : (b.probability === 'Medium' ? '#f59e0b' : '#ef4444') }}>
                                                                        {b.probability}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {latestData.comps && latestData.comps.length > 0 && (
                                            <div className="card glass full-width">
                                                <h4><Zap size={18} /> Valuation Comparable Peer Group</h4>
                                                <div className="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                {latestData.comps[0] && latestData.comps[0].map((h, i) => <th key={i}>{h}</th>)}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {latestData.comps.slice(1).map((row, i) => (
                                                                <tr key={i}>
                                                                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="dashboard-body">
                            <div className="actions-bar">
                                <h3>Search History</h3>
                                <button className="btn btn-secondary" onClick={loadHistory}>
                                    <RefreshCw size={18} /> Refresh History
                                </button>
                            </div>
                            <div className="card glass full-width">
                                <div className="table-container">
                                    {searchHistory.length === 0 ? <p>No past searches found.</p> : (
                                        <table>
                                            <thead>
                                                <tr><th>Company</th><th>Type</th><th>Industry</th><th>Date</th></tr>
                                            </thead>
                                            <tbody>
                                                {searchHistory.map((item, i) => (
                                                    <tr key={i}>
                                                        <td><strong>{item.company}</strong></td>
                                                        <td>{item.deal_type}</td>
                                                        <td>{item.analysis.industry || "N/A"}</td>
                                                        <td>Recent</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};

export default Dashboard;

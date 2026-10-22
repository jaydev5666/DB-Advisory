import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BarChart4, ArrowLeft, FileText, Globe, TrendingUp, Shield, Download, Zap } from 'lucide-react';
import GooeyNav from './GooeyNav';

const CardDetail = () => {
    const { type } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'guest', name: 'Guest User', role: 'user' });
    const data = location.state?.data;

    const navItems = [
        { label: "Home", href: "#", onClick: () => navigate('/') },
        { label: "Services", href: "#", onClick: () => navigate('/services') },
        { label: "Screener", href: "#", onClick: () => navigate('/screener') },
        { label: "Wealth Portal", href: "#", onClick: () => navigate('/wealth-portal') },
        { label: "About", href: "#", onClick: () => navigate('/about') },
        { label: "Contact", href: "#", onClick: () => navigate('/contact') }
    ];

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        }
        window.scrollTo(0, 0);
    }, [navigate]);

    if (!data) {
        return (
            <div id="landing-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2>No data available</h2>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const getIcon = () => {
        switch (type) {
            case 'overview': return <FileText size={32} />;
            case 'industry': return <Globe size={32} />;
            case 'rationale': return <TrendingUp size={32} />;
            case 'risks': return <Shield size={32} />;
            default: return <FileText size={32} />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'overview': return 'Deal Overview';
            case 'industry': return 'Industry Landscape';
            case 'rationale': return 'Investment Rationale';
            case 'risks': return 'Key Risks';
            default: return 'Detail';
        }
    };

    const getContent = () => {
        const content = data.analysis[type];
        if (Array.isArray(content)) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {content.map((item, i) => (
                        <div key={i} className="glass" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(201, 162, 39, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                    {i + 1}
                                </div>
                                <p style={{ fontSize: '18px', color: 'var(--text-main)', lineHeight: '1.6' }}>{item}</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="glass" style={{ padding: '40px', fontSize: '20px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                {content}
            </div>
        );
    };

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        setUser(null);
        navigate('/');
    };

    return (
        <div id="landing-screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <GooeyNav items={navItems} initialActiveIndex={-1} />
                <div className="header-actions">
                    <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '15px', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to Analysis
                </button>

                <div style={{ marginBottom: '36px' }}>
                    <div className="tag" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                        {getIcon()}
                        {type.toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', marginTop: '14px', color: 'var(--primary)' }}>{getTitle()}</h1>
                    <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Comprehensive intelligence for {data.company} ({data.deal_type})
                    </p>
                </div>

                <div style={{ marginBottom: '48px' }}>
                    {getContent()}
                </div>

                <div className="glass" style={{ padding: 'clamp(20px, 4vw, 36px)', background: 'rgba(201, 162, 39, 0.05)', border: '1px dashed var(--primary)' }}>
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                        <Zap size={20} color="var(--primary)" /> Analyst Commentary
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px', lineHeight: '1.6' }}>
                        "This detailed {type} view synthesizes proprietary market data with real-time sector dynamics. 
                        The identified trends are consistent with current institutional workflows and pitch-ready requirements."
                    </p>
                </div>
            </main>

            <footer className="landing-footer">
                <div className="footer-col">
                    <h3>DB Advisory & Research</h3>
                    <p>AI-driven deal intelligence for capital markets.</p>
                </div>
                <div className="footer-col">
                    <h4>Platform</h4>
                    <a onClick={() => navigate('/dashboard')}>Deal Analyzer</a>
                    <a onClick={() => navigate('/wealth-portal')}>Wealth Portal</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                </div>
                <div className="footer-col">
                    <h4>Legal</h4>
                    <p>© 2026 DB Advisory & Research. For research purposes only.</p>
                </div>
            </footer>
        </div>
    );
};

export default CardDetail;

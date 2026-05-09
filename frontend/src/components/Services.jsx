import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, Briefcase, PieChart, BarChart3, Landmark, ArrowRight, History, Users, FileText } from 'lucide-react';

const Services = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        setUser(null);
        navigate('/');
    };

    const services = [
        {
            title: "Deal Intelligence",
            description: "End-to-end AI write-ups for IPO, FPO, M&A and block deals — overview, industry context, peers, valuation and risks.",
            icon: <PieChart size={24} />
        },
        {
            title: "Valuation & Comps",
            description: "Trading and transaction comps with EV/Revenue, EV/EBITDA, P/E multiples. Auto-selected peer sets.",
            icon: <BarChart3 size={24} />
        },
        {
            title: "Bank Matrix Engine",
            description: "League-table style ranking of likely lead banks, sector strength and deal probability scoring.",
            icon: <Landmark size={24} />
        },
        {
            title: "Pitchbook Automation",
            description: "One-click pitchbook drafts: deal snapshot, comps table, valuation summary, recommendation.",
            icon: <FileText size={24} />
        },
        {
            title: "Research History",
            description: "Searchable archive of every deal you've analyzed — accessible across your team.",
            icon: <History size={24} />
        },
        {
            title: "Team Workspace",
            description: "Per-user access with secure authentication. Built for boutique and mid-market deal teams.",
            icon: <Users size={24} />
        }
    ];

    return (
        <div id="landing-screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a className="active">Services</a>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a onClick={() => navigate('/pricing')}>Pricing</a>
                    <a onClick={() => navigate('/contact')}>Contact</a>
                </nav>
                <div className="header-actions">
                    {user ? (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                    ) : (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={() => navigate('/dashboard')}>Sign in</button>
                    )}
                </div>
            </header>

            <section className="hero-section" style={{ paddingBottom: '40px' }}>
                <div className="hero-content">
                    <div className="tag"><Briefcase size={14} /> PLATFORM</div>
                    <h1 className="hero-title" style={{ fontSize: '80px' }}>Services built for deal teams.</h1>
                    <p className="hero-subtitle">A full-stack AI research platform — from initial deal screening through pitch-ready output.</p>
                </div>
            </section>

            <section className="features-section" style={{ background: 'transparent', borderTop: 'none' }}>
                <div className="features-grid">
                    {services.map((service, i) => (
                        <div key={i} className="feature-card glass">
                            <div className="icon-box">{service.icon}</div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-box glass" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '48px', marginBottom: '16px' }}>Try the live platform</h2>
                    <p style={{ marginBottom: '32px' }}>Run an end-to-end deal analysis in seconds.</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '16px 32px', fontSize: '16px' }}>
                        Launch dashboard
                    </button>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-col">
                    <h3>DB Advisory & Research</h3>
                    <p>AI-driven deal intelligence for capital markets.</p>
                </div>
                <div className="footer-col">
                    <h4>Platform</h4>
                    <a onClick={() => navigate('/dashboard')}>Deal Analyzer</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                </div>
                <div className="footer-col">
                    <h4>Company</h4>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a onClick={() => navigate('/contact')}>Contact</a>
                </div>
                <div className="footer-col">
                    <h4>Legal</h4>
                    <p>© 2026 DB Advisory & Research. For research purposes only. Not investment advice.</p>
                </div>
            </footer>
        </div>
    );
};

export default Services;

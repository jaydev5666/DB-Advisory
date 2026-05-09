import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, CreditCard, Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
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

    const tiers = [
        {
            name: "Analyst",
            price: "$49",
            subtitle: "For independent analysts and students.",
            features: [
                "20 deal analyses / month",
                "Comparable companies",
                "CSV export",
                "Email support"
            ],
            buttonText: "Start free trial",
            primary: false
        },
        {
            name: "Professional",
            price: "$199",
            subtitle: "For boutique advisory and PE shops.",
            features: [
                "Unlimited analyses",
                "Bank matrix engine",
                "Pitchbook (.pptx) export",
                "Priority support",
                "Research history"
            ],
            buttonText: "Start free trial",
            primary: true,
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            subtitle: "For investment banks and funds.",
            features: [
                "Team workspace",
                "Custom data sources",
                "API access",
                "Dedicated success manager",
                "SSO & audit logs"
            ],
            buttonText: "Contact sales",
            primary: false
        }
    ];

    return (
        <div id="landing-screen" className="screen" style={{ display: 'block' }}>
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a className="active">Pricing</a>
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

            <section className="hero-section" style={{ paddingBottom: '40px', textAlign: 'center' }}>
                <div className="hero-content" style={{ margin: '0 auto' }}>
                    <h1 className="hero-title" style={{ fontSize: '96px', marginBottom: '16px' }}>Pricing</h1>
                    <p className="hero-subtitle" style={{ fontSize: '24px', margin: '0 auto' }}>Built for analysts. Priced for teams of every size.</p>
                </div>
            </section>

            <section className="features-section" style={{ background: 'transparent', borderTop: 'none', paddingTop: 0 }}>
                <div className="features-grid">
                    {tiers.map((tier, i) => (
                        <div key={i} className="feature-card glass" style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderColor: tier.primary ? 'var(--primary)' : 'var(--border)',
                            position: 'relative',
                            padding: '48px 32px',
                            minHeight: '600px'
                        }}>
                            {tier.popular && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '24px', 
                                    left: '32px', 
                                    background: 'rgba(201, 162, 39, 0.1)', 
                                    color: 'var(--primary)', 
                                    padding: '4px 12px', 
                                    borderRadius: '12px', 
                                    fontSize: '12px', 
                                    fontWeight: '600' 
                                }}>Most popular</div>
                            )}
                            <h3 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>{tier.name}</h3>
                            <h2 style={{ fontSize: '48px', marginBottom: '8px' }}>
                                {tier.price}{tier.price !== 'Custom' && <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/mo</span>}
                            </h2>
                            <p style={{ marginBottom: '32px', fontSize: '16px' }}>{tier.subtitle}</p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '48px', flex: 1 }}>
                                {tier.features.map((f, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', color: '#334155', fontSize: '15px' }}>
                                        <Check size={18} style={{ color: 'var(--primary)', marginRight: '12px' }} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={`btn ${tier.primary ? 'btn-primary' : 'btn-secondary'} full-width`} style={{ 
                                padding: '14px', 
                                fontSize: '16px',
                                background: tier.primary ? 'var(--primary)' : 'transparent',
                                border: tier.primary ? 'none' : '1px solid #cbd5e1'
                            }}>
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
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

export default Pricing;

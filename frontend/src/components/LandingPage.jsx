import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowRight, Zap, BarChart, TrendingUp, Building2, FileSpreadsheet, Shield, Cpu, MoveRight, History } from 'lucide-react';

const LandingPage = () => {
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

    return (
        <div id="landing-screen" className="screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a className="active" onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
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

            <section className="hero-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '80px', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ flex: 1.2 }}>
                        <div className="tag" style={{ background: 'var(--surface-dim)', color: 'var(--text-muted)', fontWeight: '500', borderRadius: '100px', padding: '6px 16px', letterSpacing: '0.5px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', marginRight: '8px' }}>●</span> DB RESEARCH PLATFORM V3.4.2
                        </div>
                        <h1 className="hero-title" style={{ fontSize: '72px', lineHeight: '1.1', marginBottom: '32px' }}>
                            Institutional-grade investment banking intelligence.
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px' }}>
                            Accelerate deal flow with autonomous research workflows. Synthesize vast datasets, 
                            uncover peer group anomalies, and execute with mathematical precision.
                        </p>
                        <div className="hero-buttons" style={{ display: 'flex', gap: '20px' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '16px 32px' }}>
                                Analyze a Deal <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/services')} style={{ padding: '16px 32px' }}>
                                Explore Platform
                            </button>
                        </div>
                        <div className="hero-stats" style={{ marginTop: '64px', display: 'flex', gap: '60px' }}>
                            <div className="stat"><h3>4+</h3><p>DEAL TYPES</p></div>
                            <div className="stat"><h3>Live</h3><p>PEER MULTIPLES</p></div>
                            <div className="stat"><h3>Top 20</h3><p>BANK COVERAGE</p></div>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        <div className="glass" style={{ padding: '24px', background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1px' }}>DEAL FLOW SYNTHESIS</span>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>LIVE</span>
                            </div>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-dim)', aspectRatio: '4/3' }}>
                                <img 
                                    src="/hero-dashboard.png" 
                                    alt="Platform Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100%', height: '100%', background: 'var(--surface-dim)', zIndex: -1, borderRadius: '12px' }}></div>
                    </div>
                </div>
            </section>

            <section className="features-section" style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', padding: '120px 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 60px' }}>
                    <div style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '48px', marginBottom: '16px' }}>Autonomous Research Workflows</h2>
                        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '850px' }}>
                            Replace manual data gathering with surgical AI synthesis. Our platform structures unstructured market data into actionable intelligence in seconds.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                        {/* Peer Group Analysis Card */}
                        <div className="glass" style={{ padding: '48px', background: '#fff', border: '1px solid var(--border)' }}>
                            <div className="icon-box" style={{ background: 'var(--surface-dim)', borderRadius: '4px', width: '40px', height: '40px', color: 'var(--primary)' }}>
                                <BarChart size={20} />
                            </div>
                            <h3 style={{ fontSize: '28px', margin: '24px 0 16px' }}>Real-time Peer Group Analysis</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
                                Instantly benchmark target companies against multi-dimensional peer sets. The engine automatically ingests SEC filings, earnings transcripts, and equity research.
                            </p>
                            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <table style={{ fontSize: '13px', width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surface-dim)', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>TICKER</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>EV/EBITDA</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>REV GROWTH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderTop: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 16px' }}><strong>TGT</strong></td>
                                            <td style={{ padding: '14px 16px' }}>12.4x</td>
                                            <td style={{ padding: '14px 16px' }}>8.2%</td>
                                        </tr>
                                        <tr style={{ borderTop: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 16px' }}><strong>PEER_AVG</strong></td>
                                            <td style={{ padding: '14px 16px' }}>11.2x</td>
                                            <td style={{ padding: '14px 16px' }}>6.5%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Synthesis Card */}
                        <div className="glass" style={{ padding: '48px', background: '#fff', border: '1px solid var(--border)' }}>
                            <div className="icon-box" style={{ background: 'var(--surface-dim)', borderRadius: '4px', width: '40px', height: '40px', color: 'var(--primary)' }}>
                                <Cpu size={20} />
                            </div>
                            <h3 style={{ fontSize: '28px', margin: '24px 0 16px' }}>AI Synthesis Engine</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
                                Extract key strategic rationales from complex M&A documentation. Generates executive summaries formatted strictly for senior advisory review.
                            </p>
                            <div style={{ padding: '24px', background: 'var(--surface-dim)', borderRadius: '4px' }}>
                                <div style={{ height: '8px', width: '80%', background: '#e2e8f0', marginBottom: '16px', borderRadius: '4px' }}></div>
                                <div style={{ height: '8px', width: '100%', background: '#e2e8f0', marginBottom: '16px', borderRadius: '4px' }}></div>
                                <div style={{ height: '8px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        {/* Deal Archive Card */}
                        <div className="glass" style={{ padding: '48px', background: '#fff', border: '1px solid var(--border)' }}>
                            <div className="icon-box" style={{ background: 'var(--surface-dim)', borderRadius: '4px', width: '40px', height: '40px', color: 'var(--primary)' }}>
                                <History size={20} />
                            </div>
                            <h3 style={{ fontSize: '28px', margin: '24px 0 16px' }}>Deal Archive Matching</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
                                Query a proprietary decade-long repository of private market transactions to find precedent deals with exact structural similarities.
                            </p>
                            <button className="btn btn-secondary full-width" style={{ padding: '14px' }}>Search Archive</button>
                        </div>

                        {/* Market Intel Card */}
                        <div className="glass" style={{ padding: '48px', background: '#fff', border: '1px solid var(--border)' }}>
                            <div className="icon-box" style={{ background: 'var(--surface-dim)', borderRadius: '4px', width: '40px', height: '40px', color: 'var(--primary)' }}>
                                <TrendingUp size={20} />
                            </div>
                            <h3 style={{ fontSize: '28px', margin: '24px 0 16px' }}>Market Intel Feeds</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
                                Curated, high-signal alerts on macro shifts, regulatory filings, and competitor movements affecting your active mandates.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', background: 'var(--surface-dim)', borderRadius: '4px', fontSize: '14px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>ALERT • 10:42 AM</span>
                                    <span style={{ color: 'var(--text-muted)' }}>Regulatory Filing: Form 8-K</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', background: 'var(--surface-dim)', borderRadius: '4px', fontSize: '14px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>INTEL • 09:15 AM</span>
                                    <span style={{ color: 'var(--text-muted)' }}>Sector Shift: Healthcare Tech</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-box glass">
                    <h2>Ready to accelerate your deal workflow?</h2>
                    <p>Sign up free and run your first deal analysis in under a minute.</p>
                    <button className="btn btn-primary" style={{ padding: "10px 50px", marginTop: "20px" }} onClick={() => navigate('/dashboard')}>Get started <ArrowRight size={18} /></button>
                </div>
            </section>

            <footer style={{ padding: '40px 60px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>DB ADVISORY</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' }}>
                    © 2026 INSTITUTIONAL RESEARCH PLATFORM. STRICTLY CONFIDENTIAL.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

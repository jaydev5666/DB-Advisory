import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4 } from 'lucide-react';

const About = () => {
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
        <div id="landing-screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                    <a onClick={() => navigate('/wealth-portal')}>Wealth Portal</a>
                    <a className="active">About</a>
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

            <section className="hero-section" style={{ paddingBottom: '80px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="tag">ABOUT</div>
                    <h1 className="hero-title" style={{ fontSize: '96px', marginBottom: '48px' }}>Where capital markets<br />meet AI.</h1>
                    <p className="hero-subtitle" style={{ fontSize: '24px', maxWidth: '1000px' }}>
                        DB Advisory & Research is a next-generation deal intelligence platform built by investment banking practitioners. 
                        We combine structured AI reasoning with the workflows analysts and bankers actually use — comparable companies, 
                        valuation multiples, bank league tables, and pitch-ready outputs.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', marginTop: '80px' }}>
                        <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '24px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '16px' }}>01</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '12px' }}>Practitioner-built</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Designed by ex-IB analysts who lived the workflow.</p>
                        </div>
                        <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '24px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '16px' }}>02</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '12px' }}>Structured AI</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Tool-call enforced outputs — no hallucinated tables.</p>
                        </div>
                        <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '24px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '16px' }}>03</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '12px' }}>Pitch-ready</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Output formatted for boards, clients and committees.</p>
                        </div>
                    </div>

                    <div className="glass" style={{ marginTop: '100px', padding: '60px' }}>
                        <h2 style={{ fontSize: '42px', marginBottom: '24px' }}>Our mission</h2>
                        <p style={{ fontSize: '20px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                            To compress the time it takes to go from "what's the story on this company?" to a pitch-ready research note — 
                            from days to seconds. We believe modern AI, when paired with proper structure and IB domain expertise, 
                            can fundamentally change how deal teams work.
                        </p>
                    </div>
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
                    <a onClick={() => navigate('/wealth-portal')}>Wealth Portal</a>
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

export default About;

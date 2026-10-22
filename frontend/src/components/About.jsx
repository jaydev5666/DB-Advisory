import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4 } from 'lucide-react';
import GooeyNav from './GooeyNav';

const About = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'guest', name: 'Guest User', role: 'user' });

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        navigate('/');
    };

    const navItems = [
        { label: "Home", href: "#", onClick: () => navigate('/') },
        { label: "Services", href: "#", onClick: () => navigate('/services') },
        { label: "Screener", href: "#", onClick: () => navigate('/screener') },
        { label: "Wealth Portal", href: "#", onClick: () => navigate('/wealth-portal') },
        { label: "About", href: "#", onClick: () => navigate('/about') },
        { label: "Contact", href: "#", onClick: () => navigate('/contact') }
    ];

    return (
        <div id="landing-screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <GooeyNav items={navItems} initialActiveIndex={4} />
                <div className="header-actions">
                    {user && user.username !== 'guest' && (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                    )}
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                <section className="hero-section" style={{ padding: '40px 0' }}>
                    <div className="tag">ABOUT</div>
                    <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 6vw, 84px)', lineHeight: '1.1', marginBottom: '28px' }}>Where capital markets<br />meet AI.</h1>
                    <p className="hero-subtitle" style={{ fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '850px', lineHeight: '1.6', marginBottom: '40px' }}>
                        DB Advisory & Research is a next-generation deal intelligence platform built by investment banking practitioners. 
                        We combine structured AI reasoning with the workflows analysts and bankers actually use — comparable companies, 
                        valuation multiples, bank league tables, and pitch-ready outputs.
                    </p>

                    <div className="responsive-grid-3" style={{ marginTop: '40px' }}>
                        <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>01</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '8px' }}>Practitioner-built</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Designed by ex-IB analysts who lived the workflow.</p>
                        </div>
                        <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>02</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '8px' }}>Structured AI</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Tool-call enforced outputs — no hallucinated tables.</p>
                        </div>
                        <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>03</h2>
                            <h3 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '8px' }}>Pitch-ready</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Output formatted for boards, clients and committees.</p>
                        </div>
                    </div>

                    <div className="glass" style={{ marginTop: '48px', padding: 'clamp(20px, 4vw, 48px)' }}>
                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: '16px' }}>Our mission</h2>
                        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                            To compress the time it takes to go from "what's the story on this company?" to a pitch-ready research note — 
                            from days to seconds. We believe modern AI, when paired with proper structure and IB domain expertise, 
                            can fundamentally change how deal teams work.
                        </p>
                    </div>
                </section>
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

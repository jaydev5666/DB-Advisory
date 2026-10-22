import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, Mail, Video, Building, Send } from 'lucide-react';
import GooeyNav from './GooeyNav';

const Contact = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent! Our team will contact you shortly.');
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
                <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <BarChart4 size={28} />
                    <h2>DB Advisory <span>& Research</span></h2>
                </div>
                <GooeyNav items={navItems} initialActiveIndex={5} />
                <div className="header-actions">
                    {user && user.username !== 'guest' && (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                    )}
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                <section className="hero-section" style={{ padding: '40px 0' }}>
                    <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 'clamp(24px, 5vw, 64px)' }}>
                        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                            <div className="tag">CONTACT</div>
                            <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 6vw, 84px)', lineHeight: '1.1', marginBottom: '28px' }}>Let's talk deals.</h1>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary)', fontSize: '17px', marginBottom: '4px', margin: 0 }}>Email</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>research@dbadvisory.ai</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                        <Video size={22} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary)', fontSize: '17px', marginBottom: '4px', margin: 0 }}>Demo request</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Book a 30-min walkthrough.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                        <Building size={22} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary)', fontSize: '17px', marginBottom: '4px', margin: 0 }}>Enterprise</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Custom deployments for deal teams.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, width: '100%', maxWidth: '520px' }} className="glass">
                            <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="input-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ marginBottom: '6px', display: 'block', fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>Name</label>
                                        <input type="text" placeholder="Your name" required style={{ background: '#fff', border: '1px solid var(--border-strong)', padding: '12px', color: 'var(--text-main)', width: '100%' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ marginBottom: '6px', display: 'block', fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>Email</label>
                                        <input type="email" placeholder="Your work email" required style={{ background: '#fff', border: '1px solid var(--border-strong)', padding: '12px', color: 'var(--text-main)', width: '100%' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ marginBottom: '6px', display: 'block', fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>Message</label>
                                        <textarea
                                            placeholder="How can we help?"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: '#fff',
                                                border: '1px solid var(--border-strong)',
                                                color: 'var(--text-main)',
                                                borderRadius: '4px',
                                                minHeight: '130px'
                                            }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary full-width" style={{ padding: '14px', background: 'var(--primary)', color: '#fff' }}>
                                        Send message
                                    </button>
                                </form>
                            </div>
                        </div>
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

export default Contact;

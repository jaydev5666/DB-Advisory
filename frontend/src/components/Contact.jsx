import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, Mail, Video, Building, Send } from 'lucide-react';

const Contact = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent! Our team will contact you shortly.');
    };

    return (
        <div id="landing-screen">
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <BarChart4 size={28} />
                    <h2>DB Advisory <span>& Research</span></h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a className="active">Contact</a>
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
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '80px' }}>
                    <div style={{ flex: 1 }}>
                        <div className="tag">CONTACT</div>
                        <h1 className="hero-title" style={{ fontSize: '96px', marginBottom: '48px' }}>Let's talk deals.</h1>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '4px', margin: 0 }}>Email</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>research@dbadvisory.ai</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '4px', margin: 0 }}>Demo request</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>Book a 30-min walkthrough.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'var(--surface-dim)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--primary)', fontSize: '18px', marginBottom: '4px', margin: 0 }}>Enterprise</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>Custom deployments for deal teams.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, maxWidth: '500px' }} className="glass">
                        <div style={{ padding: '40px' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '16px', color: 'var(--primary)' }}>Name</label>
                                    <input type="text" placeholder="Your name" required style={{ background: '#fff', border: '1px solid var(--border-strong)', padding: '14px', color: 'var(--text-main)' }} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '16px', color: 'var(--primary)' }}>Email</label>
                                    <input type="email" placeholder="Your work email" required style={{ background: '#fff', border: '1px solid var(--border-strong)', padding: '14px', color: 'var(--text-main)' }} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '32px' }}>
                                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '16px', color: 'var(--primary)' }}>Message</label>
                                    <textarea
                                        placeholder="How can we help?"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: '#fff',
                                            border: '1px solid var(--border-strong)',
                                            color: 'var(--text-main)',
                                            borderRadius: '4px',
                                            minHeight: '150px'
                                        }}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary full-width" style={{ padding: '16px', background: 'var(--primary)', color: '#fff' }}>
                                    Send message
                                </button>
                            </form>
                        </div>
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

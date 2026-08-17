import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Trash2, Loader2, BarChart4, Sparkles, TrendingUp, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import GooeyNav from './GooeyNav';
import SpotlightCard from './SpotlightCard';

const Screener = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'guest', name: 'Guest User', role: 'user' });
    const [tickers, setTickers] = useState(["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "HFCL.NS", "AKUMS.NS"]);
    const [newTicker, setNewTicker] = useState("");
    const [results, setResults] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        // Auto-run scan on load
        triggerScan();
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        navigate('/');
    };

    const triggerScan = async () => {
        if (tickers.length === 0) {
            setErrorMsg("Please add at least one ticker to scan.");
            return;
        }
        setScanning(true);
        setErrorMsg("");
        try {
            const res = await api.runScreener(tickers);
            if (res.data && res.data.results) {
                setResults(res.data.results);
            } else {
                setErrorMsg("Failed to run screener. Invalid response format.");
            }
        } catch (err) {
            console.error("Screener failed:", err);
            setErrorMsg("Connection error. Ensure Flask backend is running on port 5005.");
        } finally {
            setScanning(false);
        }
    };

    const handleAddTicker = (e) => {
        e.preventDefault();
        const clean = newTicker.trim().toUpperCase();
        if (!clean) return;
        if (tickers.includes(clean)) {
            setErrorMsg("Ticker already in the list.");
            return;
        }
        setTickers([...tickers, clean]);
        setNewTicker("");
        setErrorMsg("");
    };

    const handleRemoveTicker = (tickerToRemove) => {
        setTickers(tickers.filter(t => t !== tickerToRemove));
    };

    const getScoreBadgeColor = (score) => {
        if (score >= 6) return '#10b981'; // Green
        if (score >= 4) return '#3b82f6'; // Blue
        if (score >= 2) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
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
                <GooeyNav items={navItems} initialActiveIndex={2} />
                <div className="header-actions">
                    {user && user.username !== 'guest' && (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                    )}
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="hero-section" style={{ paddingBottom: '40px' }}>
                    <div className="tag" style={{ background: 'var(--surface-dim)', color: 'var(--text-muted)' }}>
                        <Sparkles size={12} style={{ marginRight: '6px' }} /> TECHNICAL SCANNER
                    </div>
                    <h1 className="hero-title" style={{ fontSize: '72px', marginBottom: '24px' }}>
                        Professional NSE Stock Screener
                    </h1>
                    <p className="hero-subtitle" style={{ fontSize: '20px', maxWidth: '850px' }}>
                        Scan multiple equities simultaneously. Calculate moving averages, RSI strength, MACD crossovers, and directional trend velocity with instant quantitative scoring.
                    </p>
                </section>

                <section style={{ width: '100%', paddingBottom: '60px' }}>
                <div className="responsive-grid-1-3">
                    
                    {/* Left Panel: Ticker Configuration */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <SpotlightCard spotlightColor="rgba(0, 82, 204, 0.06)" style={{ background: '#fff', padding: '32px' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>Equities to Scan</h3>
                            
                            <form onSubmit={handleAddTicker} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. INFY.NS or AAPL"
                                    value={newTicker}
                                    onChange={e => setNewTicker(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button className="btn btn-primary" type="submit" style={{ padding: '10px 16px' }}>
                                    <Plus size={16} />
                                </button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
                                {tickers.map((t) => (
                                    <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--surface-dim)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{t}</span>
                                        <button onClick={() => handleRemoveTicker(t)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-primary full-width"
                                onClick={triggerScan}
                                disabled={scanning}
                                style={{ padding: '14px' }}
                            >
                                {scanning ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} /> Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} style={{ marginRight: '8px' }} /> Run Screener
                                    </>
                                )}
                            </button>
                        </SpotlightCard>

                        {/* Scanner Rules Explanation */}
                        <div className="glass" style={{ padding: '28px', background: '#fff' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                <Info size={16} style={{ color: 'var(--accent)' }} />
                                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Scoring Criteria</h4>
                            </div>
                            <ul style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.8' }}>
                                <li><strong>EMA 20 Trend:</strong> Close is above EMA 20 (+1)</li>
                                <li><strong>EMA Golden Cross:</strong> EMA 20 is above EMA 50 (+1)</li>
                                <li><strong>EMA Bullish Bias:</strong> EMA 50 is above EMA 200 (+1)</li>
                                <li><strong>RSI Momentum:</strong> RSI is between 55 and 70 (+1)</li>
                                <li><strong>MACD Signal:</strong> MACD line is above Signal line (+1)</li>
                                <li><strong>Volume Expansion:</strong> Volume is &gt; 1.5x of 20-day Avg (+1)</li>
                                <li><strong>ADX Trend Strength:</strong> ADX is above 25 (+1)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel: Scan Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {errorMsg && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px 20px', borderRadius: '4px', color: '#b91c1c' }}>
                                <AlertCircle size={20} />
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{errorMsg}</span>
                            </div>
                        )}

                        <div className="glass" style={{ background: '#fff', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Scan Results</h3>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Showing {results.length} companies scanned
                                </span>
                            </div>

                            <div className="table-container" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--surface-dim)', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>STOCK</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>SCORE</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>CLOSE PRICE</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>EMA 20 / 50 / 200</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>RSI (14)</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>MACD / SIGNAL</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>ADX</th>
                                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>VOLUME / 20D AVG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scanning ? (
                                            <tr>
                                                <td colSpan="8" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px auto', color: 'var(--primary)' }} />
                                                    Crunching technical indicators and downloading historical data...
                                                </td>
                                            </tr>
                                        ) : results.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No results found. Click "Run Screener" to execute the scanner.
                                                </td>
                                            </tr>
                                        ) : (
                                            results.map((r, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        <strong style={{ fontSize: '15px' }}>{r.stock}</strong>
                                                    </td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        {r.error ? (
                                                            <span style={{ color: '#ef4444', fontSize: '12px' }}>FAIL</span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    background: getScoreBadgeColor(r.score),
                                                                    color: '#fff',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '700'
                                                                }}
                                                            >
                                                                {r.score} / 7
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '18px 24px', fontWeight: '600' }}>
                                                        {r.error ? '-' : `₹${r.indicators.close}`}
                                                    </td>
                                                    <td style={{ padding: '18px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        {r.error ? (
                                                            <span style={{ color: '#ef4444' }}>{r.error}</span>
                                                        ) : (
                                                            <>
                                                                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{r.indicators.ema20}</span> / {r.indicators.ema50} / {r.indicators.ema200}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        {r.error ? '-' : (
                                                            <span style={{
                                                                fontWeight: '600',
                                                                color: (r.indicators.rsi > 70 || r.indicators.rsi < 30) ? '#ef4444' : 'inherit'
                                                            }}>
                                                                {r.indicators.rsi}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '18px 24px', fontSize: '12px' }}>
                                                        {r.error ? '-' : (
                                                            <>
                                                                <span style={{ color: r.indicators.macd > r.indicators.signal ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                                    {r.indicators.macd}
                                                                </span>
                                                                {' / '}
                                                                {r.indicators.signal}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        {r.error ? '-' : (
                                                            <span style={{ fontWeight: '600', color: r.indicators.adx > 25 ? '#10b981' : 'inherit' }}>
                                                                {r.indicators.adx}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '18px 24px', fontSize: '12px' }}>
                                                        {r.error ? '-' : (
                                                            <>
                                                                {r.indicators.volume.toLocaleString()}
                                                                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                                                    Avg: {r.indicators.vol20.toLocaleString()}
                                                                </div>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </main>
        </div>
    );
};

export default Screener;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowRight, Zap, BarChart, TrendingUp, TrendingDown, Building2, FileSpreadsheet, Shield, Cpu, MoveRight, History, Search, Calendar, Activity, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, detectCurrency, getAllExchangeRates, getCurrencySymbol } from '../services/api';

const MarketChartWidget = () => {
    const [ticker, setTicker]           = useState('AAPL');
    const [input, setInput]             = useState('AAPL');
    const [data, setData]               = useState([]);
    const [period, setPeriod]           = useState('1Y');
    const [loading, setLoading]         = useState(false);
    const [currency, setCurrency]       = useState({ symbol: '$', code: 'USD' });
    const [rates, setRates]             = useState({ USD: 1 });
    const [error, setError]             = useState('');
    const [stockCurrency, setStockCurrency] = useState('USD'); // native currency of current stock
    const [displayCurrency, setDisplayCurrency] = useState('USD');

    const quickPicks = ['AAPL', 'RELIANCE.NS', 'TCS.NS', 'TSLA', 'INFY.NS', 'MSFT', 'GOOGL'];

    useEffect(() => {
        (async () => {
            const c = await detectCurrency();
            const allRates = await getAllExchangeRates();
            setCurrency(c);
            setRates(allRates);
            if (c && c.code) {
                setDisplayCurrency(c.code);
            }
        })();
    }, []);

    const fetchChart = async (symbol, p) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.getChartData(symbol, p);
            // Backend now returns {data: [...], currency: "USD"/"INR"/etc.}
            const payload = res.data;
            const chartArr = payload?.data || (Array.isArray(payload) ? payload : []);
            const nativeCurrency = payload?.currency || 'USD';
            if (chartArr.length > 0) {
                setData(chartArr);
                setStockCurrency(nativeCurrency);
                setTicker(symbol);
            } else {
                setError('No data found. Try a different ticker.');
            }
        } catch {
            setError('Failed to fetch data.');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchChart(ticker, period); }, []);

    // Smart conversion: only convert when stock currency differs from target display currency
    const getDisplayRate = () => {
        const fromRate = rates?.[stockCurrency] || 1;
        const toRate = rates?.[displayCurrency] || 1;
        return toRate / fromRate;
    };

    const displayRate = getDisplayRate();
    const activeCurrencyCode = displayCurrency;
    const sym = getCurrencySymbol(activeCurrencyCode);
    const converted = data.map(d => ({ ...d, price: parseFloat((d.price * displayRate).toFixed(2)) }));
    const first = converted[0]?.price ?? 0;
    const last  = converted[converted.length-1]?.price ?? 0;
    const isUp  = last >= first;
    const changePct = first > 0 ? ((last-first)/first*100).toFixed(2) : '0.00';
    const chartColor = isUp ? '#16c784' : '#ea3943';

    return (
        <section style={{ padding:'80px 60px', background:'var(--surface-dim)', borderTop:'1px solid var(--border)' }}>
            <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
                    <div>
                        <div style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.1em', color:'var(--primary)', marginBottom:'8px' }}>LIVE MARKET CHART</div>
                        <h2 style={{ fontSize:'32px', fontWeight:800, margin:0 }}>Track any stock, live.</h2>
                        <p style={{ color:'var(--text-muted)', marginTop:'6px' }}>
                            Showing in <strong>{displayCurrency}</strong>
                            {stockCurrency && stockCurrency !== displayCurrency &&
                                <span style={{ marginLeft:'4px', fontSize:'12px' }}>(native: {stockCurrency})</span>
                            }
                        </p>
                    </div>

                    {/* Search bar */}
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <div style={{ position:'relative' }}>
                            <Search size={14} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && fetchChart(input, period)}
                                placeholder="TICKER (e.g. RELIANCE.NS)"
                                style={{ paddingLeft:'30px', paddingRight:'12px', height:'40px', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'13px', width:'220px', background:'#fff' }}
                            />
                        </div>
                        <button
                            onClick={() => fetchChart(input, period)}
                            style={{ height:'40px', padding:'0 16px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'13px' }}
                        >
                            Go
                        </button>
                        {/* Currency Dropdown Selector */}
                        <select
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                            style={{
                                height: '40px',
                                padding: '0 28px 0 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#2563eb',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%232563eb' d='M0,0 L10,0 L5,6 Z'/></svg>")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <option value="INR">₹ INR (Rupee)</option>
                            <option value="USD">$ USD (Dollar)</option>
                            <option value="EUR">€ EUR (Euro)</option>
                            <option value="RUB">₽ RUB (Ruble)</option>
                            <option value="JPY">¥ JPY (Yen)</option>
                            <option value="GBP">£ GBP (Pound)</option>
                        </select>
                    </div>
                </div>

                {/* Quick picks */}
                <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
                    {quickPicks.map(t => (
                        <button key={t} onClick={() => { setInput(t); fetchChart(t, period); }} style={{ padding:'4px 12px', borderRadius:'20px', border:'1px solid var(--border)', background: ticker===t ? 'var(--primary)' : '#fff', color: ticker===t ? '#fff' : 'var(--text-muted)', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Chart card */}
                <div className="glass" style={{ borderRadius:'16px', padding:'28px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                        <div>
                            <div style={{ fontSize:'13px', color:'var(--text-muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>{ticker}</div>
                            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', marginTop:'4px' }}>
                                {loading ? (
                                    <span style={{ fontSize:'28px', fontWeight:700, color:'var(--text-muted)' }}>Loading...</span>
                                ) : (
                                    <>
                                        <span style={{ fontSize:'32px', fontWeight:700 }}>{sym}{Number(last).toLocaleString(undefined, { minimumFractionDigits:2 })}</span>
                                        <span style={{ fontSize:'14px', fontWeight:600, color:chartColor, background:`${chartColor}18`, padding:'3px 10px', borderRadius:'20px' }}>
                                            {isUp?'▲':'▼'} {Math.abs(changePct)}%
                                        </span>
                                    </>
                                )}
                            </div>
                            {error && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'4px' }}>{error}</div>}
                        </div>
                        <div style={{ display:'flex', gap:'4px', background:'rgba(0,0,0,0.04)', borderRadius:'8px', padding:'4px' }}>
                            {['1D','1W','3M','6M','1Y','5Y'].map(p => (
                                <div key={p} onClick={() => { setPeriod(p); fetchChart(ticker, p); }} style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'12px', fontWeight: p===period?700:500, color: p===period?'#fff':'var(--text-muted)', background: p===period ? chartColor : 'transparent', cursor:'pointer', transition:'all 0.15s' }}>
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ height:'280px', width:'100%', opacity: loading ? 0.4 : 1, transition:'opacity 0.3s' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={converted} margin={{ top:4, right:0, left:0, bottom:0 }}>
                                <defs>
                                    <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="transparent" tick={{ fill:'#6b7280', fontSize:11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis stroke="transparent" tick={{ fill:'#6b7280', fontSize:11 }} tickLine={false} axisLine={false} tickFormatter={v => `${sym}${v.toLocaleString()}`} width={68} domain={['auto','auto']} />
                                <Tooltip
                                    content={({ active, payload, label }) => active && payload?.length ? (
                                        <div style={{ background:'rgba(10,12,18,0.92)', border:`1px solid ${chartColor}44`, borderRadius:'10px', padding:'10px 16px' }}>
                                            <div style={{ color:chartColor, fontWeight:700 }}>{sym}{Number(payload[0].value).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
                                            <div style={{ color:'#8b95a5', fontSize:'11px' }}>{label}</div>
                                        </div>
                                    ) : null}
                                    cursor={{ stroke:chartColor, strokeWidth:1, strokeDasharray:'4 3' }}
                                />
                                <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#landingGrad)" dot={false} activeDot={{ r:5, fill:chartColor, stroke:'#fff', strokeWidth:2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats footer */}
                    {!loading && converted.length > 0 && (
                        <div style={{ display:'flex', gap:'32px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(0,0,0,0.06)', flexWrap:'wrap' }}>
                            {[
                                { label:'Open',   value:`${sym}${Number(first).toLocaleString(undefined,{minimumFractionDigits:2})}` },
                                { label:'Close',  value:`${sym}${Number(last).toLocaleString(undefined,{minimumFractionDigits:2})}` },
                                { label:'High',   value:`${sym}${Math.max(...converted.map(d=>d.price)).toLocaleString(undefined,{minimumFractionDigits:2})}` },
                                { label:'Low',    value:`${sym}${Math.min(...converted.map(d=>d.price)).toLocaleString(undefined,{minimumFractionDigits:2})}` },
                                { label:'Change', value:`${isUp?'+':''}${changePct}%`, color:chartColor },
                                { label:'Currency', value: activeCurrencyCode, color:'var(--primary)' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'2px' }}>{label}</div>
                                    <div style={{ fontSize:'13px', fontWeight:600, color: color||'var(--text)' }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'12px', textAlign:'center' }}>
                    For NSE stocks add <strong>.NS</strong> suffix (e.g. RELIANCE.NS, TCS.NS, INFY.NS). For BSE add <strong>.BO</strong>.
                </p>
            </div>
        </section>
    );
};

// ── Top Market Movers Panel ──────────────────────────────────
const TopMoversPanel = () => {
    const [movers, setMovers] = useState({ gainers: [], losers: [], error: null });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('gainers'); // 'gainers' | 'losers'

    useEffect(() => {
        api.marketMovers()
            .then(res => {
                const d = res.data || {};
                setMovers({ gainers: d.gainers || [], losers: d.losers || [], error: d.error || null });
            })
            .catch(err => { setMovers({ gainers: [], losers: [], error: 'Network error' }); })
            .finally(() => setLoading(false));
    }, []);

    const rows = tab === 'gainers' ? movers.gainers : movers.losers;
    const isEmpty = !loading && rows.length === 0;

    return (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Activity size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>NSE Top Movers</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#10b981', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>LIVE</span>
                </div>
                <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)' }}>
                    {['gainers', 'losers'].map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '8px 18px', fontSize: '13px', fontWeight: 700,
                            border: 'none', background: 'transparent', cursor: 'pointer',
                            color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                            marginBottom: '-2px', textTransform: 'capitalize'
                        }}>
                            {t === 'gainers' ? '▲ Gainers' : '▼ Losers'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '8px 0', maxHeight: '360px', overflowY: 'auto' }}>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Loading market data…
                    </div>
                )}
                {isEmpty && (
                    <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '13px', gap:'6px' }}>
                        <Activity size={28} color="#cbd5e1" />
                        <span>Market data unavailable</span>
                        {movers.error && <span style={{ fontSize:'11px', color:'#ef4444' }}>{movers.error}</span>}
                        <span style={{ fontSize:'11px' }}>NSE data may be outside trading hours</span>
                    </div>
                )}
                {rows.map((row, i) => {
                    const sym   = row.symbol || row.Symbol || row.scripName || Object.values(row)[0] || '—';
                    const ltp   = row.ltp || row.LTP || row.lastPrice || '—';
                    const chg   = row.netPrice || row.pChange || row.change || 0;
                    const isUp  = tab === 'gainers';
                    const color = isUp ? '#16c784' : '#ea3943';
                    return (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 24px', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                            transition: 'background 0.15s', cursor: 'default'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isUp ? <TrendingUp size={14} color={color} /> : <TrendingDown size={14} color={color} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{String(sym).toUpperCase()}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NSE</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{Number(ltp).toLocaleString()}</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color }}>
                                    {isUp ? '+' : ''}{Number(chg).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Upcoming IPO Calendar Panel ──────────────────────────────
const IpoCalendarPanel = () => {
    const [ipos, setIpos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.marketIpos()
            .then(res => setIpos(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const isEmpty = !loading && ipos.length === 0;

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return 'TBA';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    };

    return (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Upcoming IPOs</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#6366f1', fontWeight: 700, background: '#eef2ff', padding: '2px 8px', borderRadius: '20px' }}>Next 90 Days</span>
            </div>

            {/* Body */}
            <div style={{ maxHeight: '404px', overflowY: 'auto' }}>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Fetching IPO calendar…
                    </div>
                )}
                {isEmpty && (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', gap: '6px' }}>
                        <Calendar size={28} color="#cbd5e1" />
                        <span style={{ fontSize: '13px' }}>No upcoming IPOs found</span>
                        <span style={{ fontSize: '11px' }}>Add Twelve Data & Finnhub keys to enable</span>
                    </div>
                )}
                {ipos.map((ipo, i) => (
                    <div key={i} style={{
                        padding: '14px 24px',
                        borderBottom: i < ipos.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s', cursor: 'default'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, marginRight: '12px' }}>
                                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{ipo.company}</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: 'var(--text-muted)', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                                        {ipo.exchange || 'N/A'}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ipo.source}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', marginBottom: '2px' }}>
                                    {formatDate(ipo.date)}
                                </div>
                                {ipo.price_low && ipo.price_low !== 'N/A' && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {ipo.price_low === ipo.price_high
                                            ? `$${ipo.price_low}`
                                            : `$${ipo.price_low} – $${ipo.price_high}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [liveNews, setLiveNews] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const fetchNews = async () => {
            try {
                const res = await api.getNews('');
                if (res.data && res.data.headlines) {
                    setLiveNews(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
            }
        };
        fetchNews();
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
                    <a onClick={() => navigate('/wealth-portal')}>Wealth Portal</a>
                    <a onClick={() => navigate('/about')}>About</a>
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

            <section className="hero-section" style={{ textAlign: 'center', padding: '100px 20px 80px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '960px', margin: '0 auto' }}>
                    <div className="tag hero-animate anim-delay-100" style={{ background: 'var(--surface-dim)', color: 'var(--text-muted)', fontWeight: '500', borderRadius: '100px', padding: '6px 16px', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', marginBottom: '32px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', marginRight: '8px' }}>●</span> DB RESEARCH PLATFORM V3.4.2
                    </div>
                    <h1 className="hero-title hero-animate anim-delay-200" style={{ fontSize: '72px', lineHeight: '1.1', marginBottom: '32px', textAlign: 'center', maxWidth: '850px' }}>
                        Institutional-grade investment banking intelligence.
                    </h1>
                    <p className="hero-subtitle hero-animate anim-delay-300" style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '750px', margin: '0 auto 48px', textAlign: 'center', lineHeight: '1.6' }}>
                        Accelerate deal flow with autonomous research workflows. Synthesize vast datasets, 
                        uncover peer group anomalies, and execute with mathematical precision.
                    </p>
                    <div className="hero-buttons hero-animate anim-delay-400" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '16px' }}>
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '16px 32px' }}>
                            Analyze a Deal <ArrowRight size={18} />
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/wealth-portal')} style={{ padding: '16px 32px', background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                            Wealth Portal <Wallet size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/services')} style={{ padding: '16px 32px' }}>
                            Explore Platform
                        </button>
                    </div>
                    <div className="hero-stats hero-animate anim-delay-500" style={{ marginTop: '64px', display: 'flex', gap: '80px', justifyContent: 'center', width: '100%' }}>
                        <div className="stat" style={{ textAlign: 'center' }}><h3 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>4+</h3><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px' }}>DEAL TYPES</p></div>
                        <div className="stat" style={{ textAlign: 'center' }}><h3 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Live</h3><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px' }}>PEER MULTIPLES</p></div>
                        <div className="stat" style={{ textAlign: 'center' }}><h3 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Top 20</h3><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px' }}>BANK COVERAGE</p></div>
                    </div>
                </div>
            </section>

            <MarketChartWidget />

            {/* Top Movers + Upcoming IPOs */}
            <section style={{ padding: '60px', background: '#fff', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '6px' }}>REAL-TIME DATA</div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Market Pulse</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '15px' }}>Live NSE movers and global IPO pipeline — updated every session.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <TopMoversPanel />
                        <IpoCalendarPanel />
                    </div>
                </div>
            </section>

            {/* Live Market Intelligence Section */}
            {liveNews && liveNews.headlines && liveNews.headlines.length > 0 && (
                <section style={{ padding: '80px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 60px' }}>
                        <div className="card glass full-width" style={{ borderLeft: '4px solid #3b82f6', background: '#f8fafc', boxShadow: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={22} /> Market Intelligence: Recent News</h4>
                                <span className={`tag ${liveNews.sentiment.toLowerCase()}`} style={{ 
                                    background: liveNews.sentiment === 'Bullish' ? '#dcfce7' : (liveNews.sentiment === 'Bearish' ? '#fee2e2' : '#e2e8f0'),
                                    color: liveNews.sentiment === 'Bullish' ? '#166534' : (liveNews.sentiment === 'Bearish' ? '#991b1b' : '#475569'),
                                    padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '800'
                                }}>
                                    {liveNews.sentiment.toUpperCase()} SENTIMENT
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {liveNews.headlines.map((h, i) => (
                                    <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="news-item" style={{ padding: '16px 20px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>{h.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{h.source.toUpperCase()}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart4, LayoutDashboard, CreditCard,
    FileText, Zap, TrendingUp, Download, RefreshCw,
    Globe, Shield, Building2, Wallet, Target, Compass, Trash2, Plus, Coins, Sparkles, HelpCircle, Activity, Info, Menu, X
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api, detectCurrency, getAllExchangeRates, getCurrencySymbol } from '../services/api';
import GooeyNav from './GooeyNav';
import {
    AreaChart, Area,
    LineChart, Line,
    BarChart, Bar, Cell,
    PieChart, Pie, Legend,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PriceChartCard = ({ company, initialData, currencyInfo, rates, initialStockCurrency }) => {
    const [period, setPeriod]           = useState('1Y');
    const [data, setData]               = useState(initialData);
    const [loading, setLoading]         = useState(false);
    const [stockCurrency, setStockCurrency] = useState(initialStockCurrency || (() => {
        const u = (company || '').toUpperCase();
        if (u.includes('.NS') || u.includes('.BO')) return 'INR';
        if (u.includes('.L')) return 'GBP';
        return 'USD';
    }));
    const userCode = currencyInfo?.code || 'USD';
    const [displayCurrency, setDisplayCurrency] = useState(userCode);

    useEffect(() => {
        if (initialData) setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (currencyInfo && currencyInfo.code) setDisplayCurrency(currencyInfo.code);
    }, [currencyInfo]);

    useEffect(() => {
        if (initialStockCurrency) {
            setStockCurrency(initialStockCurrency);
        } else if (company) {
            const u = company.toUpperCase();
            if (u.includes('.NS') || u.includes('.BO') || u.includes('RELIANCE') || u.includes('TCS') || u.includes('INFY') || u.includes('WIPRO')) {
                setStockCurrency('INR');
            } else if (u.includes('.L')) {
                setStockCurrency('GBP');
            } else {
                setStockCurrency('USD');
            }
        }
    }, [initialStockCurrency, company]);

    const getDisplayRate = () => {
        const fromRate = rates?.[stockCurrency] || 1;
        const toRate = rates?.[displayCurrency] || 1;
        return toRate / fromRate;
    };

    const displayRate = getDisplayRate();
    const sym = getCurrencySymbol(displayCurrency);

    const fmt = (val) => {
        if (!val || isNaN(val)) return `${sym}0.00`;
        return `${sym}${(parseFloat(val) * displayRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePeriodChange = async (p) => {
        if (p === period) return;
        setPeriod(p);
        setLoading(true);
        try {
            const res = await api.getChartData(company, p);
            const payload = res.data;
            const chartArr = payload?.data || (Array.isArray(payload) ? payload : []);
            const nativeCur = payload?.currency || stockCurrency;
            if (chartArr.length > 0) { setData(chartArr); setStockCurrency(nativeCur); }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (!data || data.length === 0) return null;

    const converted = data.map(d => ({ ...d, price: parseFloat((d.price * displayRate).toFixed(2)) }));
    const first = converted[0]?.price ?? 0;
    const last  = converted[converted.length - 1]?.price ?? 0;
    const isUp  = last >= first;
    const change    = (last - first).toFixed(2);
    const changePct = first > 0 ? ((last - first) / first * 100).toFixed(2) : '0.00';
    const chartColor = isUp ? '#16c784' : '#ea3943';

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background:'rgba(10,12,18,0.92)', border:`1px solid ${chartColor}44`, borderRadius:'10px', padding:'10px 16px', backdropFilter:'blur(8px)' }}>
                <div style={{ color: chartColor, fontWeight: 700, fontSize: '15px' }}>
                    {sym}{Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}
                </div>
                <div style={{ color: '#8b95a5', fontSize: '11px', marginTop: '2px' }}>{label}</div>
            </div>
        );
    };

    return (
        <div className="card glass full-width" style={{ padding:'28px 28px 20px', position:'relative' }}>
            {loading && (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.5)', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', backdropFilter:'blur(2px)' }}>
                    <div className="spinner" style={{ width:'24px', height:'24px', borderWidth:'3px' }}></div>
                </div>
            )}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', gap:'16px', flexWrap:'wrap' }}>
                <div>
                    <div style={{ fontSize:'13px', color:'var(--text-muted)', fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                        {company} · Price Performance
                        {currencyInfo && currencyInfo.code !== 'USD' && (
                            <span style={{ marginLeft:'8px', background:'var(--surface-dim)', padding:'2px 8px', borderRadius:'4px', fontSize:'10px' }}>
                                {currencyInfo.code}
                            </span>
                        )}
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'12px', marginTop:'6px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'32px', fontWeight:700, letterSpacing:'-0.5px', color:'var(--text)' }}>
                            {sym}{Number(last).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}
                        </span>
                        <span style={{ fontSize:'14px', fontWeight:600, color:chartColor, background:`${chartColor}18`, padding:'3px 10px', borderRadius:'20px' }}>
                            {isUp ? '▲' : '▼'} {Math.abs(change)} ({Math.abs(changePct)}%)
                        </span>
                    </div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>
                        vs. start of period · Open: {fmt(data[0]?.price)}
                    </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', width:'100%', maxWidth:'360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width:'100%', justifyContent:'flex-end', flexWrap:'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Currency:</span>
                        <select
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                            style={{
                                padding: '4px 24px 4px 10px',
                                borderRadius: '16px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: '1px solid var(--border)',
                                background: '#eff6ff',
                                color: '#2563eb',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%232563eb' d='M0,0 L10,0 L5,6 Z' /></svg>")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                minWidth: '150px'
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
                    <div style={{ display:'flex', gap:'4px', background:'rgba(0,0,0,0.04)', borderRadius:'8px', padding:'4px', flexWrap:'wrap', justifyContent:'flex-end' }}>
                        {['1D','1W','3M','6M','1Y','5Y'].map(p => (
                            <div key={p} onClick={() => handlePeriodChange(p)} style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'12px', fontWeight: p===period ? 700 : 500, color: p===period ? '#fff' : '#334155', background: p===period ? 'var(--primary)' : 'transparent', cursor:'pointer' }}>
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ height:'380px', width:'100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={converted} margin={{ top:4, right:0, left:0, bottom:0 }}>
                        <defs>
                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor={chartColor} stopOpacity={0.25} />
                                <stop offset="80%"  stopColor={chartColor} stopOpacity={0.03} />
                                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="transparent" tick={{ fill:'#6b7280', fontSize:11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis stroke="transparent" tick={{ fill:'#6b7280', fontSize:11 }} tickLine={false} axisLine={false} tickFormatter={v => `${sym}${v.toLocaleString()}`} width={64} domain={['auto','auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '4 3' }} />
                        <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r:5, fill:chartColor, stroke:'#fff', strokeWidth:2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display:'flex', gap:'32px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(0,0,0,0.06)', flexWrap:'wrap' }}>
                {[
                    { label:'Open',    value: fmt(data[0]?.price) },
                    { label:'Close',   value: fmt(data[data.length-1]?.price) },
                    { label:'High',    value: fmt(Math.max(...data.map(d=>d.price))) },
                    { label:'Low',     value: fmt(Math.min(...data.map(d=>d.price))) },
                    { label:'Change',  value:`${isUp?'+':''}${changePct}%`, color:chartColor },
                    { label:'Currency', value: displayCurrency, color:'var(--primary)' },
                ].map(({ label, value, color }) => (
                    <div key={label}>
                        <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'2px' }}>{label}</div>
                        <div style={{ fontSize:'13px', fontWeight:600, color: color||'var(--text)' }}>{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DEAL_CONFIGS = {
    ma: { label: 'M&A', dealType: 'M&A', color: '#6366f1', description: 'Mergers & Acquisitions — strategic fit, synergies, valuation premium analysis', showSections: ['overview', 'industry', 'rationale', 'risks', 'comps', 'benchmarking', 'banks', 'chart', 'news'] },
    ipo: { label: 'IPO', dealType: 'IPO', color: '#10b981', description: 'Initial Public Offering — equity story, listing prospects, price band analysis', showSections: ['overview', 'industry', 'rationale', 'risks', 'banks', 'chart', 'news'] },
    lbo: { label: 'LBO', dealType: 'LBO', color: '#f59e0b', description: 'Leveraged Buyout — debt capacity, cash flow stability, exit strategy', showSections: ['overview', 'rationale', 'risks', 'benchmarking', 'banks', 'chart'] },
    restr: { label: 'Restructuring', dealType: 'Restructuring', color: '#ef4444', description: 'Restructuring — debt re-profiling, asset sales, liquidity management', showSections: ['overview', 'industry', 'risks', 'banks', 'chart', 'news'] },
    ecm: { label: 'ECM', dealType: 'ECM', color: '#8b5cf6', description: 'Equity Capital Markets — follow-on offerings, rights issues, block trades', showSections: ['overview', 'rationale', 'benchmarking', 'banks', 'chart', 'news'] },
    dcm: { label: 'DCM', dealType: 'DCM', color: '#0ea5e9', description: 'Debt Capital Markets — bond issuance, credit analysis, yield positioning', showSections: ['overview', 'industry', 'risks', 'banks', 'news'] },
    pf: { label: 'Project Finance', dealType: 'Project Finance', color: '#f43f5e', description: 'Project Finance — infrastructure financing, SPV analysis, cash flow coverage', showSections: ['overview', 'industry', 'rationale', 'risks', 'banks', 'chart', 'news'] },
    valuation: { label: 'Valuation', dealType: 'M&A', color: '#14b8a6', description: 'Standalone valuation — trading comps, transaction comps, DCF triangulation', showSections: ['overview', 'comps', 'benchmarking', 'chart', 'news'] },
};

const DealRoomView = ({ dealKey, currencyInfo, setCurrencyInfo, rates }) => {
    const config = DEAL_CONFIGS[dealKey];
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [liveQuote, setLiveQuote] = useState(null);
    const [liveNews, setLiveNews] = useState(null);
    const [chartTab, setChartTab] = useState('pe');

    const handleAnalyze = async () => {
        if (!company.trim()) return;
        setLoading(true);
        setResult(null);
        setLiveQuote(null);
        setLiveNews(null);
        try {
            const res = await api.analyze(company.trim(), config.dealType);
            setResult(res.data);
            if (res.data.live_market_data) setLiveQuote(res.data.live_market_data);
            if (res.data.news_data) setLiveNews(res.data.news_data);
        } catch {
            alert('Analysis failed. Backend might be down.');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (company.length >= 1) {
            const timer = setTimeout(async () => {
                try {
                    const res = await api.getLiveQuote(company);
                    if (res.data && !res.data.error) setLiveQuote(res.data);
                } catch (e) {}
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [company]);

    const show = (section) => config.showSections.includes(section);

    return (
        <div className="dashboard-body">
            <div style={{ marginBottom: '24px', padding: '24px 28px', background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`, border: `1px solid ${config.color}25`, borderRadius: '16px', borderLeft: `6px solid ${config.color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: config.color, letterSpacing: '0.15em', marginBottom: '6px', textTransform: 'uppercase' }}>SECURE DEAL ROOM</div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>{config.label} Intelligence Center</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>{config.description}</p>
            </div>

            <div className="input-panel glass">
                <h3>Analyze a {config.label} Opportunity</h3>
                <div className="input-row">
                    <div className="input-group">
                        <label>Company Ticker / Name</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" value={company} onChange={e => setCompany(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} placeholder={`e.g. RELIANCE.NS or Apple`} style={{ paddingRight: (liveQuote && !isNaN(parseFloat(liveQuote.price))) ? '130px' : '15px' }} />
                            {liveQuote && (() => {
                                const priceVal = parseFloat(liveQuote.price);
                                if (isNaN(priceVal)) return null;
                                const getStockCurrency = (symbol) => {
                                    const u = (symbol || '').toUpperCase();
                                    if (u.includes('.NS') || u.includes('.BO') || u.includes('RELIANCE') || u.includes('TCS') || u.includes('INFY') || u.includes('WIPRO')) return 'INR';
                                    if (u.includes('.L')) return 'GBP';
                                    return 'USD';
                                };
                                const displayCurrency = currencyInfo?.code || 'USD';
                                const stockCurrency = getStockCurrency(company);
                                const fromRate = rates?.[stockCurrency] || 1;
                                const toRate = rates?.[displayCurrency] || 1;
                                const displayRate = toRate / fromRate;
                                const sym = getCurrencySymbol(displayCurrency);
                                const convertedPrice = (priceVal * displayRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                return (
                                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: config.color, color: '#fff', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, display:'flex', gap:'8px', alignItems:'center' }}>
                                        {sym}{convertedPrice}
                                        <span style={{ fontSize: '10px', opacity: 0.8, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '8px' }}>{liveQuote.source === 'yfinance' ? 'YF' : 'LIVE'}</span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading} style={{ background: config.color, borderColor: config.color }}>
                        <Zap size={18} /> Analyze {config.label}
                    </button>
                </div>
            </div>

            {loading && (
                <div id="loading">
                    <div className="spinner" style={{ borderColor: `${config.color}33`, borderTopColor: config.color }} />
                    <p>Generating real-time {config.label} intelligence for {company}…</p>
                </div>
            )}

            {result && (
                <div className="results-grid" style={{ marginTop: '24px' }}>
                    {show('overview') && (
                        <div className="card glass clickable-card" style={{ borderTop: `3px solid ${config.color}` }}><h4><FileText size={18} style={{ color: config.color }} /> Deal Overview</h4><p>{result.analysis?.overview}</p></div>
                    )}
                    {show('industry') && (
                        <div className="card glass clickable-card" style={{ borderTop: `3px solid ${config.color}` }}><h4><Globe size={18} style={{ color: config.color }} /> Industry Landscape</h4><p>{result.analysis?.industry}</p></div>
                    )}
                    {show('news') && liveNews?.headlines?.length > 0 && (
                        <div className="card glass full-width" style={{ borderLeft: `4px solid ${config.color}` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
                                <h4><Zap size={18} style={{ color: config.color }} /> Market News</h4>
                                <span style={{ background: liveNews.sentiment === 'Bullish' ? '#dcfce7' : (liveNews.sentiment === 'Bearish' ? '#fee2e2' : '#f1f5f9'), color: liveNews.sentiment === 'Bullish' ? '#166534' : (liveNews.sentiment === 'Bearish' ? '#991b1b' : '#475569'), padding:'4px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:'800' }}>{liveNews.sentiment?.toUpperCase()} SENTIMENT</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {liveNews.headlines.map((h, i) => (
                                    <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                                        <div className="news-item" style={{ padding:'12px', background:'rgba(0,0,0,0.02)', borderRadius:'6px', border:'1px solid var(--border)', transition: 'all 0.2s ease' }}>
                                            <div style={{ fontSize:'14px', fontWeight:'600' }}>{h.title}</div>
                                            <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px', fontWeight: '700' }}>{h.source?.toUpperCase()}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    {show('rationale') && (
                        <div className="card glass clickable-card" style={{ borderTop: `3px solid ${config.color}` }}><h4><TrendingUp size={18} style={{ color: config.color }} /> Investment Rationale</h4>{Array.isArray(result.analysis?.rationale) ? <ul style={{ paddingLeft:'16px', margin:0 }}>{result.analysis.rationale.map((r,i)=><li key={i} style={{ marginBottom:'4px' }}>{r}</li>)}</ul> : <p>{result.analysis?.rationale}</p>}</div>
                    )}
                    {show('risks') && (
                        <div className="card glass clickable-card" style={{ borderTop: `3px solid ${config.color}` }}><h4><Shield size={18} style={{ color: config.color }} /> Key Risks</h4>{Array.isArray(result.analysis?.risks) ? <ul style={{ paddingLeft:'16px', margin:0 }}>{result.analysis.risks.map((r,i)=><li key={i} style={{ marginBottom:'4px' }}>{r}</li>)}</ul> : <p>{result.analysis?.risks}</p>}</div>
                    )}
                    {show('chart') && result.history_data?.length > 0 && (
                        <PriceChartCard company={result.company} initialData={result.history_data} currencyInfo={currencyInfo} rates={rates} initialStockCurrency={result.currency} />
                    )}
                    {show('comps') && result.comps?.length > 0 && (
                        <div className="card glass full-width" style={{ borderTop: `3px solid ${config.color}` }}><h4><Zap size={18} style={{ color: config.color }} /> Comparable Peer Group</h4><div className="table-container"><table><thead><tr>{result.comps[0]?.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{result.comps.slice(1).map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div></div>
                    )}
                    {show('benchmarking') && result.benchmarking_data?.length > 0 && (
                        <div className="card glass full-width">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap:'wrap', gap:'12px' }}>
                                <h4><TrendingUp size={18} style={{ color: config.color }} /> Multiples Benchmarking</h4>
                                <div className="tabs" style={{ background: 'var(--surface-dim)', padding: '4px', borderRadius: '6px', display: 'flex', gap: '4px', flexWrap:'wrap' }}>
                                    <button className={`btn-tab ${chartTab === 'pe' ? 'active' : ''}`} onClick={() => setChartTab('pe')} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px', background: chartTab === 'pe' ? '#fff' : 'transparent', border: '1px solid transparent', fontWeight: 700, cursor:'pointer' }}>P/E</button>
                                    <button className={`btn-tab ${chartTab === 'ev' ? 'active' : ''}`} onClick={() => setChartTab('ev')} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px', background: chartTab === 'ev' ? '#fff' : 'transparent', border: '1px solid transparent', fontWeight: 700, cursor:'pointer' }}>EV/EBITDA</button>
                                </div>
                            </div>
                            <div style={{ height:'380px' }}><ResponsiveContainer width="100%" height="100%"><BarChart data={result.benchmarking_data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background:'#fff', border: '1px solid var(--border-strong)', borderRadius:'8px' }} itemStyle={{ color: config.color }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} /><Bar dataKey={chartTab === 'pe' ? 'pe_ratio' : 'ev_ebitda'} radius={[4,4,0,0]}>{result.benchmarking_data.map((_,i)=><Cell key={i} fill={i===0 ? config.color : 'var(--border-strong)'} />)}</Bar></BarChart></ResponsiveContainer></div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>Selected color bar indicates Target Company ({result.company})</p>
                        </div>
                    )}
                    {show('banks') && result.banks?.length > 0 && (
                        <div className="card glass full-width" style={{ borderTop: `3px solid ${config.color}` }}><h4><TrendingUp size={18} style={{ color: config.color }} /> IB Bank Matrix</h4><div className="table-container"><table><thead><tr><th>Bank</th><th>ECM Score</th><th>Probability</th></tr></thead><tbody>{result.banks.map((b,i)=>(<tr key={i}><td>{b.bank}</td><td>{b.score}</td><td style={{ color: b.probability==='High'?'#10b981':b.probability==='Medium'?'#f59e0b':'#ef4444' }}>{b.probability}</td></tr>))}</tbody></table></div></div>
                    )}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'guest', name: 'Guest User', role: 'user' });
    const [view, setView] = useState('ma');
    const [authMode, setAuthMode] = useState('signin');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [liveQuote, setLiveQuote] = useState(null);
    const [liveNews, setLiveNews] = useState(null);
    const [chartTab, setChartTab] = useState('pe');
    const [company, setCompany] = useState('');
    const [dealType, setDealType] = useState('M&A');
    const [loading, setLoading] = useState(false);
    const [latestData, setLatestData] = useState(null);
    const [currencyInfo, setCurrencyInfo] = useState({ symbol: '$', code: 'USD' });
    const [rates, setRates] = useState({ USD: 1 });

    useEffect(() => {
        (async () => {
            const currency = await detectCurrency();
            const allRates = await getAllExchangeRates();
            setCurrencyInfo(currency);
            setRates(allRates);
        })();
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('db_user');
        const savedToken = localStorage.getItem('db_token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
        } else {
            localStorage.removeItem('db_user');
            localStorage.removeItem('db_token');
            setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        }
        const savedAnalysis = localStorage.getItem('latest_analysis');
        if (savedAnalysis) setLatestData(JSON.parse(savedAnalysis));
    }, []);

    useEffect(() => {
        if (latestData) localStorage.setItem('latest_analysis', JSON.stringify(latestData));
    }, [latestData]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }).then(res => res.json());
                const userData = { username: userInfo.email, name: userInfo.name, picture: userInfo.picture, isGoogle: true };
                const res = await api.googleLogin(userData.username, userData.name);
                if (res.data.token) localStorage.setItem('db_token', res.data.token);
                localStorage.setItem('db_user', JSON.stringify(userData));
                setUser(userData);
            } catch (err) {
                console.error("Google Auth Error:", err);
                alert("Failed to get user info from Google");
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            alert("Google Sign-In failed. Please try again.");
        }
    });

    const handleLogin = async () => {
        setError('Authenticating...');
        try {
            const res = await api.login(email, password);
            if (res.data.status === 'success') {
                localStorage.setItem('db_token', res.data.token);
                localStorage.setItem('db_user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                setError('');
            } else {
                setError(res.data.message || 'Invalid credentials');
            }
        } catch (e) { setError('Error connecting to server'); }
    };

    const handleSignup = async () => {
        setError('Creating account...');
        try {
            const res = await api.signup(email, password);
            if (res.data.status === 'success') {
                if (res.data.token) {
                    localStorage.setItem('db_token', res.data.token);
                    localStorage.setItem('db_user', JSON.stringify(res.data.user || { username: email }));
                    setUser(res.data.user || { username: email });
                } else {
                    const loginRes = await api.login(email, password);
                    if (loginRes.data.status === 'success') {
                        localStorage.setItem('db_token', loginRes.data.token);
                        localStorage.setItem('db_user', JSON.stringify(loginRes.data.user));
                        setUser(loginRes.data.user);
                    }
                }
                setError('');
            } else { setError(res.data.message || 'Signup failed'); }
        } catch (e) { setError('Error connecting to server'); }
    };

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        localStorage.removeItem('db_token');
        localStorage.removeItem('latest_analysis');
        setUser({ username: 'guest', name: 'Guest User', role: 'user' });
        setMobileSidebarOpen(false);
        navigate('/');
    };

    const handleCardClick = (type) => {
        if (!latestData) return;
        navigate(`/detail/${type}`, { state: { data: latestData } });
    };

    const handleAnalyze = async () => {
        if (!company) return;
        setLoading(true);
        setLatestData(null);
        setLiveQuote(null);
        setLiveNews(null);
        try {
            const res = await api.analyze(company, dealType);
            setLatestData(res.data);
            if (res.data.live_market_data) setLiveQuote(res.data.live_market_data);
            if (res.data.news_data) setLiveNews(res.data.news_data);
            setLoading(false);
        } catch (e) {
            alert("Analysis failed. Backend might be down.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (company.length >= 1) {
            const timer = setTimeout(async () => {
                try {
                    const res = await api.getLiveQuote(company);
                    if (res.data && !res.data.error) setLiveQuote(res.data);
                } catch (e) {}
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [company]);

    const handleDownload = async () => {
        if (!latestData) return;
        try {
            const res = await api.downloadPpt(latestData);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${latestData.company}_Pitchbook.pptx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) { alert("Download failed"); }
    };

    const navItems = [
        { label: "Home", href: "#", onClick: () => navigate('/') },
        { label: "Services", href: "#", onClick: () => navigate('/services') },
        { label: "Screener", href: "#", onClick: () => navigate('/screener') },
        { label: "Wealth Portal", href: "#", onClick: () => navigate('/wealth-portal') },
        { label: "About", href: "#", onClick: () => navigate('/about') },
        { label: "Contact", href: "#", onClick: () => navigate('/contact') }
    ];

    const sidebarMenu = (
        <aside className={`db-sidebar glass ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
            <nav className="sidebar-nav">
                <div className="nav-item" style={{ cursor: 'default', pointerEvents: 'none', background: 'transparent', opacity: 0.7 }}>
                    <LayoutDashboard size={20} /> Deal Analyzer
                </div>
                <div style={{ marginTop: '24px', padding: '0 8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>DEAL ROOMS</div>
                    {[ { key: 'ma', label: 'M&A', icon: <Building2 size={16} /> }, { key: 'ipo', label: 'IPO', icon: <TrendingUp size={16} /> }, { key: 'lbo', label: 'LBO', icon: <BarChart4 size={16} /> }, { key: 'restr', label: 'Restructuring', icon: <RefreshCw size={16} /> }, { key: 'ecm', label: 'ECM', icon: <Zap size={16} /> }, { key: 'dcm', label: 'DCM', icon: <FileText size={16} /> }, { key: 'pf', label: 'Project Finance', icon: <Globe size={16} /> }, { key: 'valuation', label: 'Valuation', icon: <TrendingUp size={16} /> }, ].map(({ key, label, icon }) => (
                        <a key={key} className={`nav-item ${view === key ? 'active' : ''}`} onClick={() => { setView(key); setMobileSidebarOpen(false); }} style={{ paddingLeft: '20px', fontSize: '13px' }}>
                            {icon} {label}
                        </a>
                    ))}
                </div>
            </nav>
            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                {user.username !== 'guest' ? (
                    <>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Logged in as <strong>{user.username}</strong></p>
                        <button className="btn btn-secondary full-width" style={{ marginTop: '10px' }} onClick={handleSignOut}>Sign Out</button>
                    </>
                ) : (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Platform Access: <strong>Public</strong></p>
                )}
            </div>
        </aside>
    );

    if (!user) {
        return (
            <div id="login-screen" >
                <div className="login-container">
                    <h1 className="login-brand" style={{ textAlign: 'center' }}>DB Advisory & Research</h1>
                    <div className="auth-card glass" style={{ padding: '30px 50px 40px 40px' }}>
                        <h2 className="auth-title" style={{ textAlign: 'center' }}>{authMode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
                        <p className="auth-subtitle" style={{ textAlign: 'center' }}>{authMode === 'signin' ? 'Sign in to your dashboard.' : 'Start analyzing deals in seconds.'}</p>
                        <div className="input-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Username@gmail.com" /></div>
                        <div className="input-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" /></div>
                        <button className="btn btn-primary full-width" style={{ marginTop: '20px', padding: '10px' }} onClick={authMode === 'signin' ? handleLogin : handleSignup}>{authMode === 'signin' ? 'Sign in' : 'Sign up'}</button>
                        <div className="auth-divider"><span>or</span></div>
                        <button className="btn btn-google full-width" onClick={() => googleLogin()}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />Sign in with Google</button>
                        <p className="auth-footer">{authMode === 'signin' ? <>Don't have an account? <a onClick={() => setAuthMode('signup')}>Sign up</a></> : <>Already have an account? <a onClick={() => setAuthMode('signin')}>Sign in</a></>}</p>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', overflowX: 'hidden' }}>
            <header className="landing-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button aria-label="Open menu" className="btn" style={{ display: 'none', width: 'auto', minWidth: '40px', padding: '8px 10px', background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--primary)' }} onClick={() => setMobileSidebarOpen(v => !v)}>
                        {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                    </div>
                </div>
                <GooeyNav items={navItems} initialActiveIndex={-1} />
                <div className="header-actions">
                    {user.username !== 'guest' && (
                        <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                    )}
                </div>
            </header>

            {mobileSidebarOpen && <div className="menu-backdrop" onClick={() => setMobileSidebarOpen(false)} />}
            <div className="db-layout">
                {sidebarMenu}
                <main className="db-main">
                    {Object.keys(DEAL_CONFIGS).includes(view) && (
                        <DealRoomView key={view} dealKey={view} currencyInfo={currencyInfo} setCurrencyInfo={setCurrencyInfo} rates={rates} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

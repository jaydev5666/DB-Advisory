import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart4, LayoutDashboard, CreditCard,
    FileText, Zap, TrendingUp, Download, RefreshCw,
    Globe, Shield, Building2, Wallet, Target, Compass, Trash2, Plus, Coins, Sparkles, HelpCircle, Activity, Info
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api, detectCurrency, getAllExchangeRates, getCurrencySymbol } from '../services/api';
import {
    AreaChart, Area,
    LineChart, Line,
    BarChart, Bar, Cell,
    PieChart, Pie, Legend,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ── WEALTH CENTER VIEW ──────────────────────────────────────────────────
const WealthCenterView = ({ currencyInfo, rates }) => {
    const [subTab, setSubTab] = useState('portfolio');
    
    // Portfolio state
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [assetName, setAssetName] = useState('');
    const [assetTicker, setAssetTicker] = useState('');
    const [assetType, setAssetType] = useState('Stock');
    const [assetQty, setAssetQty] = useState('');
    const [assetPrice, setAssetPrice] = useState('');
    const [assetDate, setAssetDate] = useState(new Date().toISOString().split('T')[0]);

    // Goals state
    const [goals, setGoals] = useState([]);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalYear, setGoalYear] = useState(new Date().getFullYear() + 10);
    const [goalSavings, setGoalSavings] = useState('');
    const [goalSIP, setGoalSIP] = useState('');
    const [goalRisk, setGoalRisk] = useState('Moderate');

    // Simulator state
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [projectionYears, setProjectionYears] = useState(15);

    // Advisory state
    const [advisoryRisk, setAdvisoryRisk] = useState('Moderate');
    const [advisoryReport, setAdvisoryReport] = useState(null);
    const [loadingAdvisory, setLoadingAdvisory] = useState(false);

    const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
            const res = await api.getUserAssets();
            setAssets(res.data || []);
        } catch (err) {
            console.error("Failed to load assets", err);
        } finally {
            setLoadingAssets(false);
        }
    };

    const fetchGoals = async () => {
        setLoadingGoals(true);
        try {
            const res = await api.getUserGoals();
            setGoals(res.data || []);
        } catch (err) {
            console.error("Failed to load goals", err);
        } finally {
            setLoadingGoals(false);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchGoals();
    }, []);

    const handleAddAsset = async (e) => {
        e.preventDefault();
        if (!assetName) return;
        try {
            const res = await api.addUserAsset({
                name: assetName,
                ticker: assetTicker,
                type: assetType,
                quantity: parseFloat(assetQty) || 1,
                purchase_price: parseFloat(assetPrice) || 0,
                purchase_date: assetDate
            });
            if (res.data.status === 'success') {
                setAssetName('');
                setAssetTicker('');
                setAssetType('Stock');
                setAssetQty('');
                setAssetPrice('');
                fetchAssets();
            }
        } catch (err) {
            alert("Failed to add asset");
        }
    };

    const handleDeleteAsset = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;
        try {
            const res = await api.deleteUserAsset(id);
            if (res.data.status === 'success') {
                fetchAssets();
            }
        } catch (err) {
            alert("Failed to delete asset");
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!goalName) return;
        try {
            const res = await api.addUserGoal({
                name: goalName,
                target_amount: parseFloat(goalTarget) || 0,
                target_year: parseInt(goalYear) || (new Date().getFullYear() + 10),
                current_savings: parseFloat(goalSavings) || 0,
                monthly_contribution: parseFloat(goalSIP) || 0,
                risk_appetite: goalRisk
            });
            if (res.data.status === 'success') {
                setGoalName('');
                setGoalTarget('');
                setGoalYear(new Date().getFullYear() + 10);
                setGoalSavings('');
                setGoalSIP('');
                setGoalRisk('Moderate');
                fetchGoals();
            }
        } catch (err) {
            alert("Failed to add goal");
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            const res = await api.deleteUserGoal(id);
            if (res.data.status === 'success') {
                fetchGoals();
            }
        } catch (err) {
            alert("Failed to delete goal");
        }
    };

    const handleGenerateAdvisory = async () => {
        setLoadingAdvisory(true);
        setAdvisoryReport(null);
        try {
            const res = await api.getWealthAdvisory(advisoryRisk);
            setAdvisoryReport(res.data);
        } catch (err) {
            alert("Failed to generate advisory report");
        } finally {
            setLoadingAdvisory(false);
        }
    };

    const displayCurrency = currencyInfo?.code || 'USD';
    const sym = getCurrencySymbol(displayCurrency);
    const currentRate = rates?.[displayCurrency] || 1;

    const totalCost = assets.reduce((sum, a) => sum + (a.quantity * a.purchase_price), 0);
    const totalValue = assets.reduce((sum, a) => sum + (a.quantity * (a.current_price || a.purchase_price)), 0);
    const totalProfit = totalValue - totalCost;
    const profitPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const typeTotals = assets.reduce((acc, a) => {
        const t = a.type || 'Other';
        const val = a.quantity * (a.current_price || a.purchase_price);
        acc[t] = (acc[t] || 0) + val;
        return acc;
    }, {});

    const pieData = Object.keys(typeTotals).map(k => ({
        name: k,
        value: Math.round(typeTotals[k] * currentRate * 100) / 100
    }));

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

    const generateProjectionData = () => {
        const dataPoints = [];
        const startBalance = totalValue + goals.reduce((sum, g) => sum + g.current_savings, 0);
        const monthlySIP = goals.reduce((sum, g) => sum + g.monthly_contribution, 0);
        const rate = expectedReturn / 100;
        const monthlyRate = rate / 12;

        let currentVal = startBalance;
        let totalContrib = startBalance;

        dataPoints.push({
            year: 'Year 0',
            contributions: Math.round(totalContrib * currentRate),
            value: Math.round(currentVal * currentRate)
        });

        for (let i = 1; i <= projectionYears; i++) {
            for (let m = 0; m < 12; m++) {
                currentVal = (currentVal + monthlySIP) * (1 + monthlyRate);
                totalContrib += monthlySIP;
            }
            dataPoints.push({
                year: `Year ${i}`,
                contributions: Math.round(totalContrib * currentRate),
                value: Math.round(currentVal * currentRate)
            });
        }
        return dataPoints;
    };

    const projectionData = generateProjectionData();

    return (
        <div className="dashboard-body">
            <div style={{
                marginBottom: '24px',
                padding: '24px 28px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '16px',
                borderLeft: '6px solid #6366f1',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', letterSpacing: '0.15em', marginBottom: '6px', textTransform: 'uppercase' }}>
                    SECURE PORTFOLIO & WEALTH PORTAL
                </div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
                    Wealth Management Center
                </h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>
                    Track your multi-asset portfolio, configure compounding savings goals, and consult the AI strategist for allocation advice.
                </p>
            </div>

            {/* Inner Sub-navigation */}
            <div className="tabs" style={{ background: 'var(--surface-dim)', padding: '4px', borderRadius: '8px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
                <button 
                    className={`btn-tab ${subTab === 'portfolio' ? 'active' : ''}`} 
                    onClick={() => setSubTab('portfolio')} 
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: subTab === 'portfolio' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                    <Wallet size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Portfolio Tracker
                </button>
                <button 
                    className={`btn-tab ${subTab === 'planner' ? 'active' : ''}`} 
                    onClick={() => setSubTab('planner')} 
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: subTab === 'planner' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                    <Target size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Wealth Planning
                </button>
            </div>

            {subTab === 'portfolio' ? (
                <div>
                    {/* Metrics Banner */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                        <div className="card glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Portfolio Value</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>
                                {sym}{(totalValue * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="card glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Invested Cost Basis</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '8px' }}>
                                {sym}{(totalCost * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="card glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Absolute Net Return</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: totalProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '8px' }}>
                                {totalProfit >= 0 ? '+' : ''}{sym}{(totalProfit * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="card glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Performance Percentage</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: totalProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '8px' }}>
                                {totalProfit >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    <div className="results-grid">
                        {/* Allocation Pie Chart */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <h4>Asset Allocation</h4>
                            {pieData.length > 0 ? (
                                <div style={{ height: '260px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${sym}${value.toLocaleString()}`, 'Value']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                                    No assets added yet. Allocation metrics will show here.
                                </div>
                            )}
                        </div>

                        {/* Add Asset Form */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <h4>Add New Holding</h4>
                            <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '12px' }}>Asset Name</label>
                                    <input type="text" value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="e.g. Apple Inc or Bitcoin" required style={{ padding: '8px 12px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Ticker Symbol (Optional)</label>
                                        <input type="text" value={assetTicker} onChange={e => setAssetTicker(e.target.value)} placeholder="e.g. AAPL or BTC-USD" style={{ padding: '8px 12px' }} />
                                    </div>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Asset Type</label>
                                        <select value={assetType} onChange={e => setAssetType(e.target.value)} style={{ padding: '8px 12px' }}>
                                            <option value="Stock">Stock / Equity</option>
                                            <option value="Mutual Fund">Mutual Fund</option>
                                            <option value="Crypto">Cryptocurrency</option>
                                            <option value="Gold">Gold / Metals</option>
                                            <option value="Cash">Cash / Currency</option>
                                            <option value="Bond">Bonds / Fixed Income</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Quantity</label>
                                        <input type="number" step="any" value={assetQty} onChange={e => setAssetQty(e.target.value)} placeholder="e.g. 10" required style={{ padding: '8px 12px' }} />
                                    </div>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Avg Purchase Price (USD)</label>
                                        <input type="number" step="any" value={assetPrice} onChange={e => setAssetPrice(e.target.value)} placeholder="e.g. 150" required style={{ padding: '8px 12px' }} />
                                    </div>
                                </div>
                                <button className="btn btn-primary" type="submit" style={{ marginTop: '10px', padding: '10px' }}>
                                    <Plus size={16} /> Add Asset
                                </button>
                            </form>
                        </div>

                        {/* Holdings Table */}
                        <div className="card glass full-width" style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4>Current Portfolio Holdings</h4>
                                <button className="btn btn-secondary" onClick={fetchAssets} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                    <RefreshCw size={12} /> Refresh Live Valuation
                                </button>
                            </div>
                            {loadingAssets ? (
                                <div className="spinner" />
                            ) : assets.length > 0 ? (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Asset Name</th>
                                                <th>Type</th>
                                                <th>Qty</th>
                                                <th>Avg Cost Basis</th>
                                                <th>Live Current Price</th>
                                                <th>Total Value</th>
                                                <th>Return (%)</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assets.map((a) => {
                                                const livePrice = a.current_price || a.purchase_price;
                                                const costVal = a.quantity * a.purchase_price;
                                                const liveVal = a.quantity * livePrice;
                                                const diff = liveVal - costVal;
                                                const diffPct = costVal > 0 ? (diff / costVal) * 100 : 0;
                                                return (
                                                    <tr key={a.id}>
                                                        <td style={{ fontWeight: '600' }}>
                                                            {a.name}
                                                            {a.ticker && <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '6px', background: 'var(--surface-dim)', padding: '2px 6px', borderRadius: '4px' }}>{a.ticker}</span>}
                                                        </td>
                                                        <td>{a.type}</td>
                                                        <td>{a.quantity}</td>
                                                        <td>{sym}{(a.purchase_price * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ color: a.current_price ? '#10b981' : 'inherit' }}>
                                                            {sym}{(livePrice * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            {a.current_price && <span style={{ fontSize: '9px', fontWeight: 'bold', marginLeft: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>LIVE</span>}
                                                        </td>
                                                        <td style={{ fontWeight: '700' }}>{sym}{(liveVal * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ fontWeight: '600', color: diff >= 0 ? '#10b981' : '#ef4444' }}>
                                                            {diff >= 0 ? '+' : ''}{diffPct.toFixed(2)}%
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button 
                                                                onClick={() => handleDeleteAsset(a.id)}
                                                                style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', padding: '6px 8px', borderRadius: '4px' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No assets registered yet. Use the form above to add custom stocks, funds, cash, or alternative assets.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Goals Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                        {/* Left: Add Goal Form */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <h4>Add Savings Goal</h4>
                            <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '12px' }}>Goal Name</label>
                                    <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. Retirement, Buying House" required style={{ padding: '8px 12px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Target Amount (USD)</label>
                                        <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="e.g. 500000" required style={{ padding: '8px 12px' }} />
                                    </div>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Target Year</label>
                                        <input type="number" value={goalYear} onChange={e => setGoalYear(e.target.value)} placeholder="e.g. 2040" required style={{ padding: '8px 12px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Current Savings (USD)</label>
                                        <input type="number" value={goalSavings} onChange={e => setGoalSavings(e.target.value)} placeholder="e.g. 25000" style={{ padding: '8px 12px' }} />
                                    </div>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px' }}>Monthly SIP (USD)</label>
                                        <input type="number" value={goalSIP} onChange={e => setGoalSIP(e.target.value)} placeholder="e.g. 500" style={{ padding: '8px 12px' }} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '12px' }}>Risk Profile</label>
                                    <select value={goalRisk} onChange={e => setGoalRisk(e.target.value)} style={{ padding: '8px 12px' }}>
                                        <option value="Conservative">Conservative (Low Volatility)</option>
                                        <option value="Moderate">Moderate Balanced</option>
                                        <option value="Aggressive">Aggressive (High Yield alternative asset routes)</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" type="submit" style={{ marginTop: '8px', padding: '10px' }}>
                                    <Plus size={16} /> Create Wealth Goal
                                </button>
                            </form>
                        </div>

                        {/* Right: Goals Progress Tracker */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4>Active Goals & Projections</h4>
                                <button className="btn btn-secondary" onClick={fetchGoals} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                    <RefreshCw size={12} /> Sync Goals
                                </button>
                            </div>
                            {loadingGoals ? (
                                <div className="spinner" />
                            ) : goals.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {goals.map((g) => {
                                        const pct = Math.min(100, Math.round((g.current_savings / g.target_amount) * 100));
                                        return (
                                            <div key={g.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <div>
                                                        <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{g.name}</h5>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Year: {g.target_year} | Risk: {g.risk_appetite}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{sym}{(g.current_savings * currentRate).toLocaleString()} / {sym}{(g.target_amount * currentRate).toLocaleString()}</div>
                                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Monthly SIP: {sym}{(g.monthly_contribution * currentRate).toLocaleString()}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteGoal(g.id)}
                                                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Sleek Progress Bar */}
                                                <div style={{ height: '8px', background: 'var(--surface-dim)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '4px' }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    <span>Goal Progress</span>
                                                    <span>{pct}% Completed</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No financial goals set. Build savings targets to simulate long-term projections.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Projections Simulator */}
                    <div className="card glass" style={{ marginTop: '24px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4>Compounding Growth Projections</h4>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Return Rate: <strong>{expectedReturn}%</strong></label>
                                    <input type="range" min="5" max="20" value={expectedReturn} onChange={e => setExpectedReturn(parseFloat(e.target.value))} style={{ width: '120px' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Time Horizon: <strong>{projectionYears} Yrs</strong></label>
                                    <input type="range" min="5" max="40" value={projectionYears} onChange={e => setProjectionYears(parseInt(e.target.value))} style={{ width: '120px' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} formatter={(v) => `${sym}${v.toLocaleString()}`} />
                                    <Tooltip formatter={(value) => [`${sym}${value.toLocaleString()}`, '']} />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Projected Value" />
                                    <Area type="monotone" dataKey="contributions" stroke="var(--border-strong)" strokeWidth={1} fillOpacity={0.05} fill="#444" name="Contributions" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Wealth Advisor */}
                    <div className="card glass" style={{ marginTop: '24px', padding: '28px', borderLeft: '6px solid #8b5cf6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                                <Sparkles size={20} /> AI Wealth Advisory strategist
                            </h4>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <select value={advisoryRisk} onChange={e => setAdvisoryRisk(e.target.value)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                                    <option value="Conservative">Conservative Profile</option>
                                    <option value="Moderate">Moderate Profile</option>
                                    <option value="Aggressive">Aggressive Profile</option>
                                </select>
                                <button className="btn btn-primary" onClick={handleGenerateAdvisory} disabled={loadingAdvisory} style={{ background: '#8b5cf6', borderColor: '#8b5cf6', padding: '8px 16px', fontSize: '13px' }}>
                                    {loadingAdvisory ? 'Analyzing...' : 'Generate advisory Plan'}
                                </button>
                            </div>
                        </div>

                        {loadingAdvisory && (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="spinner" style={{ borderTopColor: '#8b5cf6' }} />
                                <p style={{ marginTop: '12px', fontSize: '13.5px' }}>AI compiling holdings, compounding variables, and risk matrices to formulate strategy...</p>
                            </div>
                        )}

                        {advisoryReport && (
                            <div className="results-grid" style={{ marginTop: '24px' }}>
                                {/* Asset Allocation Recommendation */}
                                <div className="card glass" style={{ padding: '20px' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>Strategic Allocation Target</h5>
                                    <div style={{ height: '200px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.keys(advisoryReport.recommendedAllocation || {}).map(k => ({
                                                        name: k,
                                                        value: advisoryReport.recommendedAllocation[k]
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={70}
                                                    dataKey="value"
                                                    label={(entry) => `${entry.name}: ${entry.value}%`}
                                                >
                                                    {Object.keys(advisoryReport.recommendedAllocation || {}).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => `${v}%`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Goal Feasibility */}
                                <div className="card glass" style={{ padding: '20px' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>Feasibility & Compounding Assessment</h5>
                                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                        "{advisoryReport.goalFeasibility}"
                                    </p>
                                </div>

                                {/* Action Advice */}
                                <div className="card glass full-width" style={{ padding: '20px' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>Strategic Recommendations</h5>
                                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                                        {(advisoryReport.strategicAdvice || []).map((item, i) => (
                                            <li key={i} style={{ color: 'var(--text-main)' }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Risk Mitigation */}
                                <div className="card glass full-width" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.02)', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px', color: '#ef4444' }}>Downside Risk Mitigation</h5>
                                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                                        {(advisoryReport.riskMitigation || []).map((item, i) => (
                                            <li key={i} style={{ color: 'var(--text-muted)' }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── COMPETITOR & MARKET INTELLIGENCE VIEW ────────────────────────────────
const MarketIntelView = ({ currencyInfo, rates }) => {
    const [subTab, setSubTab] = useState('leaderboard');
    
    // Leaderboard state
    const [firms, setFirms] = useState([]);
    const [loadingFirms, setLoadingFirms] = useState(false);
    const [firmTypeFilter, setFirmTypeFilter] = useState('Asset Management');
    const [expandedFirmId, setExpandedFirmId] = useState(null);

    // Acquisitions state
    const [acquisitions, setAcquisitions] = useState([]);
    const [macroTrends, setMacroTrends] = useState([]);
    const [loadingAcquisitions, setLoadingAcquisitions] = useState(false);

    // Fee simulator state
    const [simAum, setSimAum] = useState(100); // in Billions USD
    const [simFee, setSimFee] = useState(0.4); // in % (Expense ratio)
    const [simAdvisoryRate, setSimAdvisoryRate] = useState(0.8); // in %
    const [simAlternativeAllocation, setSimAlternativeAllocation] = useState(15); // in %

    const fetchFirms = async () => {
        setLoadingFirms(true);
        try {
            const res = await api.getCompetitors();
            setFirms(res.data || []);
        } catch (err) {
            console.error("Failed to load firms", err);
        } finally {
            setLoadingFirms(false);
        }
    };

    const fetchAcquisitions = async () => {
        setLoadingAcquisitions(true);
        try {
            const res = await api.getAcquisitions();
            setAcquisitions(res.data.acquisitions || []);
            setMacroTrends(res.data.macroTrends || []);
        } catch (err) {
            console.error("Failed to load acquisitions", err);
        } finally {
            setLoadingAcquisitions(false);
        }
    };

    useEffect(() => {
        if (subTab === 'leaderboard') fetchFirms();
        if (subTab === 'acquisitions') fetchAcquisitions();
    }, [subTab]);

    const displayCurrency = currencyInfo?.code || 'USD';
    const sym = getCurrencySymbol(displayCurrency);
    const currentRate = rates?.[displayCurrency] || 1;

    const formatMoney = (val, rateMultiplier = 1) => {
        const v = val * rateMultiplier;
        if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)} Trillion`;
        if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(2)} Billion`;
        if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(2)} Million`;
        return `${sym}${v.toLocaleString()}`;
    };

    const filteredFirms = firms.filter(f => f.type === firmTypeFilter);

    // Sim calculations
    const simRevenue = (simAum * 1e9) * (simFee / 100);
    const simAdvisoryRevenue = (simAum * 1e9) * (simAdvisoryRate / 100);
    const alternativePipelineFlow = (simAum * 1e9) * (simAlternativeAllocation / 100);

    const ALLOC_COLORS = {
        'Equities': '#6366f1',
        'Fixed Income': '#10b981',
        'Alternatives': '#f59e0b',
        'Cash': '#0ea5e9'
    };

    const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="dashboard-body">
            <div style={{
                marginBottom: '24px',
                padding: '24px 28px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '16px',
                borderLeft: '6px solid #10b981',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', letterSpacing: '0.15em', marginBottom: '6px', textTransform: 'uppercase' }}>
                    COMPETITOR INTELLIGENCE & TRACKING MODULE
                </div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
                    Global Market Intelligence
                </h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>
                    Track structural allocations of the top ten global leaders in wealth and asset management, analyze recent fintech/infrastructure M&A activity, and model fee scaling revenues.
                </p>
            </div>

            {/* Sub-navigation */}
            <div className="tabs" style={{ background: 'var(--surface-dim)', padding: '4px', borderRadius: '8px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
                <button 
                    className={`btn-tab ${subTab === 'leaderboard' ? 'active' : ''}`} 
                    onClick={() => setSubTab('leaderboard')} 
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: subTab === 'leaderboard' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                    <Building2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Global Leaderboard
                </button>
                <button 
                    className={`btn-tab ${subTab === 'acquisitions' ? 'active' : ''}`} 
                    onClick={() => setSubTab('acquisitions')} 
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: subTab === 'acquisitions' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                    <Activity size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> M&A Deal Tracker
                </button>
                <button 
                    className={`btn-tab ${subTab === 'simulator' ? 'active' : ''}`} 
                    onClick={() => setSubTab('simulator')} 
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: subTab === 'simulator' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                    <LineChart size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Fee & Route Simulator
                </button>
            </div>

            {subTab === 'leaderboard' ? (
                <div>
                    {/* Leaderboard Segment Selector */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <button 
                            className="btn" 
                            onClick={() => { setFirmTypeFilter('Asset Management'); setExpandedFirmId(null); }}
                            style={{ 
                                background: firmTypeFilter === 'Asset Management' ? 'var(--primary)' : '#fff',
                                color: firmTypeFilter === 'Asset Management' ? '#fff' : 'var(--primary)',
                                border: '1px solid var(--border-strong)',
                                padding: '8px 16px', fontSize: '13px'
                            }}
                        >
                            Asset Management Leaders (Scale & Tech)
                        </button>
                        <button 
                            className="btn" 
                            onClick={() => { setFirmTypeFilter('Wealth Management'); setExpandedFirmId(null); }}
                            style={{ 
                                background: firmTypeFilter === 'Wealth Management' ? 'var(--primary)' : '#fff',
                                color: firmTypeFilter === 'Wealth Management' ? '#fff' : 'var(--primary)',
                                border: '1px solid var(--border-strong)',
                                padding: '8px 16px', fontSize: '13px'
                            }}
                        >
                            Wealth Management Giants (Private Capital)
                        </button>
                    </div>

                    {loadingFirms ? (
                        <div className="spinner" />
                    ) : (
                        <div className="card glass">
                            <h4>Top 10 Global {firmTypeFilter} Firms</h4>
                            <div className="table-container" style={{ marginTop: '16px' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                                            <th>Firm Name</th>
                                            <th>Headquarters</th>
                                            <th>Core Allocation Strategy</th>
                                            <th>Total AUM / Client Assets</th>
                                            <th>Tech Integration Focus</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFirms.map((f) => {
                                            const isExpanded = expandedFirmId === f.id;
                                            return (
                                                <React.Fragment key={f.id}>
                                                    <tr 
                                                        onClick={() => setExpandedFirmId(isExpanded ? null : f.id)}
                                                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                        className="competitor-row"
                                                    >
                                                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>{f.globalRank}</td>
                                                        <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                                            {f.firmName}
                                                            <span style={{ fontSize: '10px', color: 'var(--accent)', marginLeft: '8px', textDecoration: 'underline' }}>inspect allocation</span>
                                                        </td>
                                                        <td>{f.headquarters}</td>
                                                        <td style={{ fontStyle: 'italic', fontSize: '13px' }}>{f.primaryStrategy}</td>
                                                        <td style={{ fontWeight: '700' }}>{formatMoney(f.totalAUM, currentRate)}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {f.techStackFocus.map((tech, i) => (
                                                                    <span key={i} style={{ fontSize: '10px', background: 'var(--surface-dim)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '100px', fontWeight: '600' }}>
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan="6" style={{ background: 'var(--surface-dim)', padding: '24px' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
                                                                    <div>
                                                                        <h5 style={{ fontWeight: '700', marginBottom: '8px' }}>Public Holding Allocations</h5>
                                                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                                            Reported asset allocation targets for {f.firmName} based on regulatory reporting.
                                                                        </p>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                                        <div style={{ width: '150px', height: '150px' }}>
                                                                            <ResponsiveContainer width="100%" height="100%">
                                                                                <PieChart>
                                                                                    <Pie
                                                                                        data={Object.keys(f.portfolioAllocation || {}).map(k => ({
                                                                                            name: k,
                                                                                            value: f.portfolioAllocation[k]
                                                                                        }))}
                                                                                        cx="50%"
                                                                                        cy="50%"
                                                                                        outerRadius={55}
                                                                                        dataKey="value"
                                                                                    >
                                                                                        {Object.keys(f.portfolioAllocation || {}).map((entry, index) => (
                                                                                            <Cell key={`cell-${index}`} fill={ALLOC_COLORS[entry] || '#ccc'} />
                                                                                        ))}
                                                                                    </Pie>
                                                                                    <Tooltip formatter={(v) => `${v}%`} />
                                                                                </PieChart>
                                                                            </ResponsiveContainer>
                                                                        </div>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                            {Object.keys(f.portfolioAllocation || {}).map((key) => (
                                                                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                                                                    <span style={{ width: '10px', height: '10px', background: ALLOC_COLORS[key] || '#ccc', borderRadius: '50%' }} />
                                                                                    <span>{key}: <strong>{f.portfolioAllocation[key]}%</strong></span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : subTab === 'acquisitions' ? (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                        {/* Acquisitions Timeline */}
                        <div className="card glass">
                            <h4>M&A and Technology Acquisitions Timeline</h4>
                            {loadingAcquisitions ? (
                                <div className="spinner" />
                            ) : acquisitions.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                    {acquisitions.map((deal) => (
                                        <div key={deal.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', right: '16px', top: '16px', background: deal.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: deal.status === 'Completed' ? '#166534' : '#d97706', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '100px' }}>
                                                {deal.status.toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{deal.targetCategory}</div>
                                            <h5 style={{ fontSize: '16px', fontWeight: '800', margin: '4px 0 6px', color: 'var(--primary)' }}>
                                                {deal.buyerFirmName} acquired {deal.targetName}
                                            </h5>
                                            <p style={{ fontSize: '13px', margin: '0 0 10px' }}>
                                                <strong>Strategic Intent:</strong> {deal.strategicIntent}
                                            </p>
                                            <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <span>Deal Value: <strong style={{ color: 'var(--text-main)' }}>{deal.dealValue > 0 ? formatMoney(deal.dealValue, currentRate) : 'Undisclosed'}</strong></span>
                                                <span>Announced: <strong>{deal.announcementDate}</strong></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center' }}>No transactions recorded.</div>
                            )}
                        </div>

                        {/* Macro Trends */}
                        <div className="card glass">
                            <h4>Acquisitions Category volume</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Total transaction value deployed by top firms segmented by target asset categories.
                            </p>
                            {macroTrends.length > 0 ? (
                                <div>
                                    <div style={{ height: '220px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={macroTrends} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                                <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} formatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                                                <YAxis type="category" dataKey="category" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} width={80} />
                                                <Tooltip formatter={(value) => [formatMoney(value / currentRate), 'Value']} />
                                                <Bar dataKey="totalValue" radius={[0, 4, 4, 0]}>
                                                    {macroTrends.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {macroTrends.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                                                <span>{item.category} ({item.count} deals)</span>
                                                <strong style={{ color: 'var(--primary)' }}>{formatMoney(item.totalValue, currentRate)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                                    Metrics loading...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Fee Simulator & Routing Flowchart */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Left: Fee Revenue Simulator */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <h4>Firm Revenue & Scale Simulator</h4>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Model how management and advisory fees scale at massive institutional assets under management (AUM) levels.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <label>Simulated Assets (AUM / Client Assets)</label>
                                        <strong>{formatMoney(simAum * 1e9, currentRate)}</strong>
                                    </div>
                                    <input type="range" min="1" max="12000" value={simAum} onChange={e => setSimAum(parseFloat(e.target.value))} />
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>Drag to simulate from $1 Billion to $12 Trillion AUM</span>
                                </div>

                                <div className="input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <label>Asset Management Expense Ratio</label>
                                        <strong>{simFee.toFixed(2)}%</strong>
                                    </div>
                                    <input type="range" min="0.02" max="2.0" step="0.01" value={simFee} onChange={e => setSimFee(parseFloat(e.target.value))} />
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>ETF/Mutual fund passive to active management fees</span>
                                </div>

                                <div className="input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <label>Wealth Private Advisory Rate</label>
                                        <strong>{simAdvisoryRate.toFixed(2)}%</strong>
                                    </div>
                                    <input type="range" min="0.1" max="2.0" step="0.05" value={simAdvisoryRate} onChange={e => setSimAdvisoryRate(parseFloat(e.target.value))} />
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>Advisor management fee percentage</span>
                                </div>

                                <div className="input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <label>Alternatives Pipeline Allocation</label>
                                        <strong>{simAlternativeAllocation}%</strong>
                                    </div>
                                    <input type="range" min="0" max="50" step="1" value={simAlternativeAllocation} onChange={e => setSimAlternativeAllocation(parseInt(e.target.value))} />
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>Routing share into infrastructure & private equity yield assets</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface-dim)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                                    <span>Estimated Asset Mgmt Annual Fees:</span>
                                    <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{formatMoney(simRevenue, currentRate)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                                    <span>Estimated Wealth Advisory Fees:</span>
                                    <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{formatMoney(simAdvisoryRevenue, currentRate)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                                    <span>Capital Routed into Alternatives:</span>
                                    <strong style={{ color: '#f59e0b', fontSize: '15px' }}>{formatMoney(alternativePipelineFlow, currentRate)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Right: Flowchart diagram */}
                        <div className="card glass" style={{ padding: '24px' }}>
                            <h4>Operational Workflows & Risk Routing Flow</h4>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                A structured representation of BlackRock's Aladdin risk model and Morgan Stanley wealth routing.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', borderLeft: '4px solid #6366f1' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>1. Central Assets Under Management (AUM)</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pooling equity and retail deposits. Current Sim Scale: {formatMoney(simAum * 1e9, currentRate)}</div>
                                </div>
                                <div style={{ textAlign: 'center', color: '#6366f1' }}>↓</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>2A. Aladdin Risk Engine</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Stress-testing core passive equity and fixed-income portfolios.</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>2B. Alternative pipeline</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Routing {formatMoney(alternativePipelineFlow, currentRate)} into infrastructure / private equity.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', justifyItems: 'center', color: 'var(--text-muted)' }}>
                                    <span>↓</span>
                                    <span>↓</span>
                                </div>

                                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>3. Institutional & Client Distribution</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Refining wealth advisories with yield strategies to optimize risk-adjusted returns.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── MAIN WEALTH DASHBOARD COMPONENT ──────────────────────────────────────
const WealthDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [view, setView] = useState('wealth_center'); // default to wealth center
    const [authMode, setAuthMode] = useState('signin');

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Currency State
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
            setUser(null);
        }
    }, []);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                const userData = {
                    username: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    isGoogle: true
                };

                // Save user to MongoDB backend
                const res = await api.googleLogin(userData.username, userData.name);
                if (res.data.token) {
                    localStorage.setItem('db_token', res.data.token);
                }

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
        } catch (e) {
            setError('Error connecting to server');
        }
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
                    // Fallback to auto-login
                    const loginRes = await api.login(email, password);
                    if (loginRes.data.status === 'success') {
                        localStorage.setItem('db_token', loginRes.data.token);
                        localStorage.setItem('db_user', JSON.stringify(loginRes.data.user));
                        setUser(loginRes.data.user);
                    }
                }
                setError('');
            } else {
                setError(res.data.message || 'Signup failed');
            }
        } catch (e) {
            setError('Error connecting to server');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('db_user');
        localStorage.removeItem('db_token');
        setUser(null);
        navigate('/');
    };

    if (!user) {
        return (
            <div id="login-screen">
                <div className="login-container">
                    <h1 className="login-brand" style={{ textAlign: 'center' }}>DB Advisory & Research</h1>
                    <div className="auth-card glass" style={{ padding: '30px 50px 40px 40px' }}>
                        <h2 className="auth-title" style={{ textAlign: 'center' }}>{authMode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
                        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
                            {authMode === 'signin' ? 'Sign in to your wealth portal.' : 'Access private wealth management.'}
                        </p>

                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Username@gmail.com"
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button className="btn btn-primary full-width" style={{ marginTop: '20px', padding: '10px' }} onClick={authMode === 'signin' ? handleLogin : handleSignup}>
                            {authMode === 'signin' ? 'Sign in' : 'Sign up'}
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button className="btn btn-google full-width" onClick={() => googleLogin()}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
                            Sign in with Google
                        </button>

                        <p className="auth-footer">
                            {authMode === 'signin' ? (
                                <>Don't have an account? <a onClick={() => setAuthMode('signup')}>Sign up</a></>
                            ) : (
                                <>Already have an account? <a onClick={() => setAuthMode('signin')}>Sign in</a></>
                            )}
                        </p>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
            <header className="landing-header">
                <div className="logo" style={{ cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DB ADVISORY</h2>
                </div>
                <nav className="landing-nav">
                    <a onClick={() => navigate('/')}>Home</a>
                    <a onClick={() => navigate('/services')}>Services</a>
                    <a className="active" onClick={() => navigate('/wealth-portal')}>Wealth Portal</a>
                    <a onClick={() => navigate('/about')}>About</a>
                    <a onClick={() => navigate('/contact')}>Contact</a>
                </nav>
                <div className="header-actions">
                    <button className="btn" style={{ color: 'var(--primary)', background: 'transparent' }} onClick={handleSignOut}>Sign out</button>
                </div>
            </header>

            <div className="db-layout" style={{ flex: 1, overflow: 'hidden' }}>
                <aside className="db-sidebar glass">
                    <nav className="sidebar-nav">
                        <div className="nav-item" style={{ cursor: 'default', pointerEvents: 'none', background: 'transparent', opacity: 0.7 }}>
                            <LayoutDashboard size={20} /> Wealth Portal
                        </div>
                        <div style={{ marginTop: '24px', padding: '0 8px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>
                                WEALTH SERVICES
                            </div>
                            <a
                                className={`nav-item ${view === 'wealth_center' ? 'active' : ''}`}
                                onClick={() => setView('wealth_center')}
                                style={{ paddingLeft: '20px', fontSize: '13px' }}
                            >
                                <Wallet size={16} /> Wealth Center
                            </a>
                            <a
                                className={`nav-item ${view === 'market_intel' ? 'active' : ''}`}
                                onClick={() => setView('market_intel')}
                                style={{ paddingLeft: '20px', fontSize: '13px' }}
                            >
                                <Compass size={16} /> Market Intel
                            </a>
                        </div>
                    </nav>
                    <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Logged in as <strong>{user.username}</strong></p>
                        <button className="btn btn-secondary full-width" style={{ marginTop: '10px' }} onClick={handleSignOut}>Sign Out</button>
                    </div>
                </aside>

                <main className="db-main">
                    {view === 'wealth_center' && (
                        <WealthCenterView
                            currencyInfo={currencyInfo}
                            rates={rates}
                        />
                    )}

                    {view === 'market_intel' && (
                        <MarketIntelView
                            currencyInfo={currencyInfo}
                            rates={rates}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default WealthDashboard;

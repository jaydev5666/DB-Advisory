import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

// Create an axios instance to handle base configuration
const client = axios.create({
    baseURL: API_URL
});

// Add a request interceptor to include the JWT token in all requests
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('db_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ── Currency config by country code ──────────────────────────
export const CURRENCY_MAP = {
    IN: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
    US: { symbol: '$', code: 'USD', name: 'US Dollar' },
    GB: { symbol: '£', code: 'GBP', name: 'British Pound' },
    EU: { symbol: '€', code: 'EUR', name: 'Euro' },
    JP: { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
    AU: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
    CA: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
    SG: { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar' },
    HK: { symbol: 'HK$', code: 'HKD', name: 'Hong Kong Dollar' },
    DEFAULT: { symbol: '$', code: 'USD', name: 'US Dollar' },
};

// Detect user's country via free IP geolocation (no key needed)
export const detectCurrency = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const countryCode = data.country_code;
        // EU countries
        const euCountries = ['DE','FR','IT','ES','NL','BE','AT','PT','FI','IE','GR','LU','SK','SI','EE','LV','LT','MT','CY'];
        if (euCountries.includes(countryCode)) return CURRENCY_MAP['EU'];
        return CURRENCY_MAP[countryCode] || CURRENCY_MAP['DEFAULT'];
    } catch {
        return CURRENCY_MAP['DEFAULT'];
    }
};

// Fetch live USD → target currency rate (free, no key)
export const getExchangeRate = async (targetCurrencyCode) => {
    if (targetCurrencyCode === 'USD') return 1;
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await res.json();
        return data.rates[targetCurrencyCode] || 1;
    } catch {
        return 1;
    }
};

// Fetch all live USD → target currency rates
export const getAllExchangeRates = async () => {
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await res.json();
        return data.rates || { USD: 1 };
    } catch {
        return { USD: 1 };
    }
};

// Map currency code to symbol
export const getCurrencySymbol = (code) => {
    const map = {
        INR: '₹',
        USD: '$',
        GBP: '£',
        EUR: '€',
        JPY: '¥',
        RUB: '₽',
        AUD: 'A$',
        CAD: 'C$',
        SGD: 'S$',
        HKD: 'HK$',
    };
    return map[(code || '').toUpperCase()] || '$';
};

// Convert a USD price to local currency
export const convertPrice = (usdPrice, rate, currencyInfo) => {
    if (!usdPrice || isNaN(usdPrice)) return 'N/A';
    const converted = (parseFloat(usdPrice) * rate).toFixed(2);
    return `${currencyInfo.symbol}${Number(converted).toLocaleString()}`;
};

export const api = {
    login: (username, password) => client.post(`/login`, { username, password }),
    signup: (username, password) => client.post(`/signup`, { username, password }),
    googleLogin: (username, name) => client.post(`/google-login`, { username, name }),
    analyze: (company, deal_type) => client.post(`/analyze`, { company, deal_type }),
    getHistory: () => client.get(`/history`),
    downloadPpt: (data) => client.post(`/download_ppt`, data, { responseType: 'blob' }),
    getNews: (company) => client.get(`/news${company ? `?company=${company}` : ''}`),
    getLiveQuote: (ticker) => client.get(`/live-quote?ticker=${ticker}`),
    getChartData: (company, period) => client.get(`/chart-data?company=${company}&period=${period}`),

    // ── New Twelve Data / Finnhub market routes ──────────────
    marketQuote: (symbol, exchange = 'NSE') =>
        client.get(`/market/quote?symbol=${symbol}&exchange=${exchange}`),
    marketChart: (symbol, exchange = 'NSE', interval = '1day', period = '90') =>
        client.get(`/market/chart?symbol=${symbol}&exchange=${exchange}&interval=${interval}&period=${period}`),
    marketIpos: () =>
        client.get(`/market/ipos`),
    marketMovers: () =>
        client.get(`/market/movers`),
    marketIndex: (index = '^NSEI', exchange = 'NSE') =>
        client.get(`/market/index?index=${index}&exchange=${exchange}`),
    trackVisit: () =>
        client.post(`/track-visit`),
    getAdminStats: () =>
        client.get(`/admin/stats`),

    // ── Asset & Wealth Management, and Competitor Intelligence ──
    getUserAssets: () => client.get(`/api/user/assets`),
    addUserAsset: (data) => client.post(`/api/user/assets`, data),
    deleteUserAsset: (id) => client.post(`/api/user/assets/delete`, { id }),
    getUserGoals: () => client.get(`/api/user/wealth/goals`),
    addUserGoal: (data) => client.post(`/api/user/wealth/goals`, data),
    deleteUserGoal: (id) => client.post(`/api/user/wealth/goals/delete`, { id }),
    getWealthAdvisory: (riskProfile) => client.post(`/api/user/wealth/advisory`, { risk_profile: riskProfile }),
    getCompetitors: () => client.get(`/api/competitors`),
    getAcquisitions: () => client.get(`/api/competitors/acquisitions`),
};

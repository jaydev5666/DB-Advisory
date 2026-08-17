import yfinance as yf
import pandas as pd
import time

# Simple global in-memory cache to avoid repeated API requests
_screener_cache = {}
CACHE_DURATION_SECS = 600  # 10 minutes cache

def calculate_screener_score(df):
    if len(df) < 200:
        return {
            "score": 0,
            "error": "Insufficient data (need at least 200 trading days)",
            "indicators": {}
        }
    
    # EMAs
    df["EMA20"] = df["Close"].ewm(span=20, adjust=False).mean()
    df["EMA50"] = df["Close"].ewm(span=50, adjust=False).mean()
    df["EMA200"] = df["Close"].ewm(span=200, adjust=False).mean()
    
    # RSI
    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=13, adjust=False).mean()
    avg_loss = loss.ewm(com=13, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    df["RSI"] = 100 - (100 / (1 + rs))
    
    # MACD
    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()
    df["MACD"] = ema12 - ema26
    df["SIGNAL"] = df["MACD"].ewm(span=9, adjust=False).mean()
    
    # ADX
    df['H-L'] = df['High'] - df['Low']
    df['H-PC'] = abs(df['High'] - df['Close'].shift(1))
    df['L-PC'] = abs(df['Low'] - df['Close'].shift(1))
    df['TR'] = df[['H-L', 'H-PC', 'L-PC']].max(axis=1)
    
    df['+DM'] = df['High'].diff()
    df['-DM'] = -df['Low'].diff()
    df['+DM'] = df['+DM'].where((df['+DM'] > df['-DM']) & (df['+DM'] > 0), 0)
    df['-DM'] = df['-DM'].where((df['-DM'] > df['+DM']) & (df['-DM'] > 0), 0)
    
    df['TR14'] = df['TR'].ewm(com=13, adjust=False).mean()
    df['+DM14'] = df['+DM'].ewm(com=13, adjust=False).mean()
    df['-DM14'] = df['-DM'].ewm(com=13, adjust=False).mean()
    
    df['+DI14'] = 100 * (df['+DM14'] / (df['TR14'] + 1e-9))
    df['-DI14'] = 100 * (df['-DM14'] / (df['TR14'] + 1e-9))
    
    df['DX'] = 100 * (abs(df['+DI14'] - df['-DI14']) / (df['+DI14'] + df['-DI14'] + 1e-9))
    df['ADX'] = df['DX'].ewm(com=13, adjust=False).mean()
    
    # VOL20
    df["VOL20"] = df["Volume"].rolling(20).mean()
    
    x = df.iloc[-1]
    
    score = 0
    if float(x["Close"]) > float(x["EMA20"]): score += 1
    if float(x["EMA20"]) > float(x["EMA50"]): score += 1
    if float(x["EMA50"]) > float(x["EMA200"]): score += 1
    if 55 < float(x["RSI"]) < 70: score += 1
    if float(x["MACD"]) > float(x["SIGNAL"]): score += 1
    if float(x["Volume"]) > 1.5 * float(x["VOL20"]): score += 1
    if float(x["ADX"]) > 25: score += 1
    
    return {
        "score": score,
        "indicators": {
            "close": round(float(x["Close"]), 2),
            "ema20": round(float(x["EMA20"]), 2),
            "ema50": round(float(x["EMA50"]), 2),
            "ema200": round(float(x["EMA200"]), 2),
            "rsi": round(float(x["RSI"]), 2),
            "macd": round(float(x["MACD"]), 2),
            "signal": round(float(x["SIGNAL"]), 2),
            "adx": round(float(x["ADX"]), 2),
            "volume": int(x["Volume"]),
            "vol20": round(float(x["VOL20"]), 2)
        }
    }

def run_screener_logic(tickers, force_refresh=False):
    now = time.time()
    results = []
    
    for s in tickers:
        s = s.strip().upper()
        if not s:
            continue
        
        # Check cache if not forced refresh
        if not force_refresh and s in _screener_cache:
            cache_data, cache_time = _screener_cache[s]
            if now - cache_time < CACHE_DURATION_SECS:
                results.append(cache_data)
                continue
        
        # Download and compute
        try:
            d = yf.download(s, period="1y", progress=False, auto_adjust=True)
            if not d.empty and isinstance(d.columns, pd.MultiIndex):
                d.columns = d.columns.get_level_values(0)
            if d.empty:
                res_item = {
                    "stock": s,
                    "score": 0,
                    "error": "No data returned for ticker",
                    "indicators": {}
                }
            else:
                res = calculate_screener_score(d)
                res_item = {
                    "stock": s,
                    "score": res["score"],
                    "error": res.get("error", ""),
                    "indicators": res["indicators"]
                }
        except Exception as e:
            import traceback
            traceback.print_exc()
            res_item = {
                "stock": s,
                "score": 0,
                "error": str(e),
                "indicators": {}
            }
        
        # Save to cache
        _screener_cache[s] = (res_item, now)
        results.append(res_item)
        
    return results

if __name__ == "__main__":
    # If run directly as a separate module, execute the default NSE screener list
    STOCKS = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "HFCL.NS", "AKUMS.NS"]
    print(f"Running technical scanner for default stock set: {STOCKS}...\n")
    
    scan_results = run_screener_logic(STOCKS)
    
    rows = []
    for r in scan_results:
        if r["error"]:
            rows.append({"Stock": r["stock"], "Score": f"ERROR: {r['error']}"})
        else:
            rows.append({
                "Stock": r["stock"],
                "Score": r["score"],
                "Close": r["indicators"]["close"],
                "RSI": r["indicators"]["rsi"],
                "ADX": r["indicators"]["adx"]
            })
            
    print(pd.DataFrame(rows))

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests, os, json
from pymongo import MongoClient
from datetime import datetime
import pandas as pd
from pptx import Presentation
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from frontend

API_KEY = os.getenv("API_KEY")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["db_advisory"]
users_col = db["users"]
history_col = db["history"]

def init_db():
    # In MongoDB, collections are created on first insert
    # Add default admin user if not exists
    if not users_col.find_one({"username": "admin"}):
        users_col.insert_one({"username": "admin", "password": "1234"})
    print("MongoDB connection established and initialized.")

init_db()

def get_fallback_data(company, deal_type):
    # Try to clean company name/ticker
    search_term = company.strip().upper()
    
    try:
        stock = yf.Ticker(search_term)
        info = stock.info
        
        # If no info, try to search for the ticker first
        if not info or 'symbol' not in info or 'sector' not in info:
            print(f"No direct info for {search_term}, trying search...")
            # Newer yfinance versions use yf.Search().tickers but older ones might differ
            try:
                search = yf.Search(search_term).tickers
                if search and len(search) > 0:
                    search_term = search[0]
                    stock = yf.Ticker(search_term)
                    info = stock.info
            except Exception:
                # Fallback search method
                ticker = yf.Ticker(search_term)
                if not ticker.info:
                    print("Ticker search failed.")
                else:
                    info = ticker.info

        if search_term.lower() in ["g", "genpact"]:
            return {
                "overview": "Status: Publicly traded on the NYSE (Ticker: G) since its IPO in August 2007. Current Price: $34.14 (as of May 4, 2026). Market Cap: Approximately $5.76B - $5.83B.",
                "industry": "Sector: Professional Services / IT & Business Process Management (BPM). Key Trend: Transitioning to Agentic AI and 'AI Gigafactories.' 92% of executives in Genpact's network expect agentic AI to fundamentally change operations by 2027.",
                "peers": [], # Let AI decide or leave empty if fallback
                "valuation": "P/E Ratio (TTM): 10.97x, which is currently lower than its 5-year average, reflecting sector-wide 'AI deflation' concerns. Dividend Yield: 2.18% (Annual dividend of $0.75 per share). Revenue Growth: 2026 outlook projects at least 7% reported growth.",
                "rationale": "AI Leadership: Recognized as a 'Leader' in the ISG Provider Lens 2026 for ServiceNow ecosystem partners. Shareholder Returns: Aggressive dividend increases ($0.68 to $0.75) and high institutional ownership (~96%). Strategic Positioning: Strong pivot from traditional BPO to AI-led process intelligence.",
                "risks": "AI Deflation: General market fear that AI efficiency gains might reduce total contract values for traditional outsourcing. Technical Weakness: Shares are currently trading near 52-week lows ($33.14) and below 50/200-day moving averages. Earnings Volatility: Q1 2026 earnings are scheduled for May 7, 2026.",
                "banks": [
                    {"name": "Goldman Sachs", "ecm_score": 5, "sector_score": 5, "region_score": 5},
                    {"name": "Morgan Stanley", "ecm_score": 5, "sector_score": 4, "region_score": 5}
                ],
                "figures": "Market Cap: ~$5.8B, Current Price: $34.14, P/E: 10.97x, Dividend Yield: 2.18%."
            }
        
        if info and "sector" in info:
            name = info.get("shortName", search_term)
            sector = info.get("sector", "N/A")
            industry = info.get("industry", "N/A")
            summary = info.get("longBusinessSummary", "")
            market_cap = info.get("marketCap", "N/A")
            if isinstance(market_cap, (int, float)): market_cap = f"${market_cap / 1e9:.2f}B"
            price = info.get("currentPrice", "N/A")
            pe = info.get("trailingPE", "N/A")
            
            return {
                "overview": f"{name} ({search_term}) is a publicly traded company. Current Price: ${price}. Market Cap: {market_cap}.",
                "industry": f"Sector: {sector} / Industry: {industry}. {summary}",
                "peers": [],
                "valuation": f"P/E Ratio: {pe}. Valuation driven by {industry} market trends.",
                "rationale": f"Based on its position in the {sector} sector and a market cap of {market_cap}, {name} represents a standard market opportunity.",
                "risks": f"General market volatility, sector-specific macroeconomic shifts in {industry}, and competitive pressures.",
                "banks": [
                    {"name": "Goldman Sachs", "ecm_score": 5, "sector_score": 5, "region_score": 5},
                    {"name": "Morgan Stanley", "ecm_score": 4, "sector_score": 5, "region_score": 4},
                    {"name": "JP Morgan", "ecm_score": 5, "sector_score": 4, "region_score": 5}
                ],
                "figures": f"Price: ${price}, Market Cap: {market_cap}, P/E: {pe}"
            }
    except Exception as e:
        print(f"YFinance fallback error: {e}")
        
    return {
        "overview": f"Detailed {deal_type} intelligence for {company} based on current market positioning.",
        "industry": "Institutional Research",
        "peers": [],
        "valuation": "Analysis based on historical sector multiples.",
        "rationale": "Strategic growth potential and market leadership.",
        "risks": "Standard macroeconomic and operational risks apply.",
        "banks": [
            {"name": "Tier 1 Bank", "ecm_score": 5, "sector_score": 5, "region_score": 5},
            {"name": "Tier 2 Bank", "ecm_score": 4, "sector_score": 4, "region_score": 4}
        ],
        "figures": "Real-time figures currently unavailable for this specific search."
    }

def generate_analysis(company, deal_type, market_context=""):
    if not API_KEY or API_KEY == "sk-proj-your-real-api-key-goes-here...":
        return get_fallback_data(company, deal_type)
        
    prompt = f"""
Act as a Senior Investment Banking Analyst at a Tier 1 global investment bank.

Today's Date: {datetime.utcnow().strftime('%Y-%m-%d')}
Company: {company}
Target Deal Type: {deal_type}

LIVE MARKET CONTEXT (MANDATORY TO USE):
{market_context}

STRICT ANALYSIS INSTRUCTIONS:

1. DEAL CONTEXT ENFORCEMENT:
   - If Deal Type is "IPO": Focus on capital structure, listing prospects, equity story, and potential valuation ranges. If the company is already public, treat this as a "Secondary/Follow-on Offering" and focus on how the new capital will be used.
   - If Deal Type is "M&A": Focus on strategic fit, potential synergies (cost and revenue), market consolidation, and valuation premium.
   - If Deal Type is "LBO": Focus on cash flow stability, debt capacity, operational improvement opportunities, and exit strategies (e.g., IPO or Trade Sale).
   - If Deal Type is "Restructuring": Focus on debt re-profiling, asset sales, liquidity management, and turnaround strategy.

2. Determine whether {company} is already publicly traded. If public, explicitly mention the current stock ticker and exchange in the overview.

3. Use the most recent available market intelligence, earnings trends, valuation data, sector performance, and capital markets activity from 2024/2025 knowledge.

4. The response MUST sound like a real institutional equity research / ECM banking note:
   - Highly analytical
   - Numerically driven
   - Concise but insight-heavy
   - No generic wording
   - No placeholder language
   - Include real market commentary and sector sentiment

5. VERY IMPORTANT:
   - Blend financial figures naturally INTO the text.
   - Do NOT output robotic isolated numbers.
   - Example style:
     "The company generated approximately $4.5B revenue with EBITDA margins near 18%, while trading around 16x forward EBITDA versus peers at 18-22x."
   - Every section should feel like authentic sell-side banking commentary.

6. Word Limit Guidance:
   - "overview" and "industry" MUST be comprehensive (150-250 words each).
   - "valuation" should be a detailed 200-word analysis of multiples and market positioning.
   - Depth and quality are CRITICAL. Do not truncate or provide short summaries.

Return ONLY a valid JSON object with EXACTLY these keys:

{{
  "overview": "Professional executive summary with ticker (if public), market positioning, strategic context, and transaction framing.",
  
  "industry": "Detailed industry analysis including sector growth, AI/digital trends, recent M&A activity, macroeconomic headwinds, margin trends, and investor sentiment.",
  
  "peers": ["TICKER1", "TICKER2", "TICKER3"],
  
  "valuation": "Detailed valuation commentary using current EV/EBITDA, P/E, revenue multiples, peer premium/discount discussion, and public market positioning.",
  
  "rationale": [
    "Investment rationale point 1",
    "Investment rationale point 2",
    "Investment rationale point 3",
    "Investment rationale point 4"
  ],
  
  "risks": [
    "Commercial/financial risk 1",
    "Commercial/financial risk 2",
    "Commercial/financial risk 3",
    "Commercial/financial risk 4"
  ],
  
  "banks": [
    {{
      "name": "Bank Name",
      "ecm_score": 1-5,
      "sector_score": 1-5,
      "region_score": 1-5
    }}
  ],
  
  "figures": "Integrated professional financial summary including Market Cap, Revenue, EBITDA, margins, growth profile, leverage commentary, valuation range, and stock performance where relevant."
}}

FINAL OUTPUT RULES:
- Output ONLY valid JSON.
- No markdown.
- No explanations.
- No introductory text.
- No trailing comments.
"""

    # Determine which endpoint to use
    is_openrouter = API_KEY.startswith("sk-or")
    is_gemini = API_KEY.startswith("AIzaSy")
    
    try:
        if is_gemini:
            # Use stable v1 API
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={API_KEY}"
            payload = {
                "contents": [{
                    "parts": [{"text": prompt + "\nRespond ONLY with valid JSON. Do NOT include markdown code blocks or backticks."}]
                }]
            }
            response = requests.post(url, json=payload)
            res_json = response.json()
            
            if 'error' in res_json:
                print(f"Gemini API Error Detail:", json.dumps(res_json, indent=2))
                return get_fallback_data(company, deal_type)
            
            if 'candidates' not in res_json or not res_json['candidates']:
                print(f"Gemini Response Error: No candidates found. Response: {json.dumps(res_json, indent=2)}")
                return get_fallback_data(company, deal_type)
                
            content = res_json['candidates'][0]['content']['parts'][0]['text']
            # Clean up potential markdown backticks from Gemini
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)

        url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        if is_openrouter:
            headers["HTTP-Referer"] = "http://localhost:5174"
            headers["X-Title"] = "DB Advisory Platform"

        response = requests.post(
            url,
            headers=headers,
            json={
                "model": "openai/gpt-4o-mini" if is_openrouter else "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
        )
        res_json = response.json()
        if 'error' in res_json:
            print(f"API Error Detail:", json.dumps(res_json, indent=2))
            return get_fallback_data(company, deal_type)
            
        content = res_json['choices'][0]['message']['content']
        return json.loads(content)
    except Exception as e:
        print("API CALL CRITICAL ERROR:", e)
        import traceback
        traceback.print_exc()
        return get_fallback_data(company, deal_type)

def get_historical_data(company_query):
    try:
        # First find the actual ticker
        ticker = company_query
        search_res = requests.get(f"https://query2.finance.yahoo.com/v1/finance/search?q={company_query}", headers={'User-Agent': 'Mozilla/5.0'}).json()
        if search_res.get('quotes'):
            ticker = search_res['quotes'][0]['symbol']
            
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y")
        if hist.empty: return []
        
        # Sample data to 20 points for cleaner charting
        if len(hist) > 20:
            step = len(hist) // 20
            hist = hist.iloc[::step]
        
        chart_data = []
        for date, row in hist.iterrows():
            chart_data.append({
                "date": date.strftime('%b %Y'),
                "price": round(row['Close'], 2)
            })
        return chart_data
    except Exception as e:
        print(f"History fetch error for {company_query}: {e}")
        return []

def get_financials(company_query):
    try:
        ticker = company_query
        search_res = requests.get(f"https://query2.finance.yahoo.com/v1/finance/search?q={company_query}", headers={'User-Agent': 'Mozilla/5.0'}).json()
        if search_res.get('quotes'):
            ticker = search_res['quotes'][0]['symbol']

        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "name": info.get("shortName", ticker),
            "price": info.get("currentPrice", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "ev_ebitda": info.get("enterpriseToEbitda", 0)
        }
    except Exception as e:
        return {"name": company_query, "price": 0, "pe_ratio": 0, "ev_ebitda": 0}

def generate_comps(peers):
    if not peers or not isinstance(peers, list):
        return []
    
    comps = [["Company", "Price", "P/E", "EV/EBITDA"]]
    for p in peers[:3]: 
        data = get_financials(p)
        price = f"${data['price']}" if isinstance(data['price'], (int, float)) else data['price']
        pe = f"{data['pe_ratio']:.1f}x" if isinstance(data['pe_ratio'], (int, float)) else data['pe_ratio']
        ev = f"{data['ev_ebitda']:.1f}x" if isinstance(data['ev_ebitda'], (int, float)) else data['ev_ebitda']
        comps.append([p, price, pe, ev])
    return comps

def generate_bank_matrix(company, deal_type, ai_banks=None):
    # Use AI-provided banks if available, otherwise use defaults
    if ai_banks and isinstance(ai_banks, list) and len(ai_banks) > 0:
        banks = []
        for b in ai_banks:
            banks.append({
                "name": b.get("name", "Unknown Bank"),
                "ecm": b.get("ecm_score", 3),
                "sector": b.get("sector_score", 3),
                "region": b.get("region_score", 3)
            })
    else:
        banks = [
            {"name": "Goldman Sachs", "ecm": 5, "sector": 5, "region": 5},
            {"name": "Morgan Stanley", "ecm": 5, "sector": 4, "region": 5},
            {"name": "JP Morgan", "ecm": 4, "sector": 4, "region": 5},
            {"name": "Kotak Mahindra Capital", "ecm": 4, "sector": 4, "region": 3},
            {"name": "ICICI Securities", "ecm": 3, "sector": 3, "region": 4}
        ]
        
    results = []
    for b in banks:
        score = (b["ecm"] * 0.4) + (b["sector"] * 0.3) + (b["region"] * 0.3)
        if score >= 4.5: prob = "High"
        elif score >= 3.5: prob = "Medium"
        else: prob = "Low"
        results.append({
            "bank": b["name"],
            "score": round(score,2),
            "probability": prob
        })
    return results

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = users_col.find_one({"username": username, "password": password})
    
    if user:
        return jsonify({"status": "success"})
    return jsonify({"status": "fail"})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"status": "fail", "message": "Missing credentials"})
    
    if users_col.find_one({"username": username}):
        return jsonify({"status": "fail", "message": "Username already exists"})
    
    users_col.insert_one({"username": username, "password": password})
    return jsonify({"status": "success", "message": "Account created successfully"})

@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    username = data.get('username') # This will be the email
    name = data.get('name')
    
    # Check if user exists
    user = users_col.find_one({"username": username})
    
    if not user:
        # Create new user for Google login (no password needed)
        users_col.insert_one({
            "username": username,
            "name": name,
            "auth_type": "google",
            "created_at": datetime.utcnow()
        })
        return jsonify({"status": "success", "message": "New Google user created"})
    
    return jsonify({"status": "success", "message": "Existing Google user logged in"})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    company = data.get('company')
    deal_type = data.get('deal_type')
    
    # Fetch live figures for context
    market_context = ""
    try:
        stock = yf.Ticker(company)
        info = stock.info
        if info:
            market_context = f"Market Cap: {info.get('marketCap', 'N/A')}, Revenue: {info.get('totalRevenue', 'N/A')}, EBITDA: {info.get('ebitda', 'N/A')}, Trailing P/E: {info.get('trailingPE', 'N/A')}, Sector: {info.get('sector', 'N/A')}"
    except:
        pass

    analysis = generate_analysis(company, deal_type, market_context)
    peers = analysis.get("peers", []) if isinstance(analysis, dict) else []
    ai_banks = analysis.get("banks", []) if isinstance(analysis, dict) else []
    
    comps = generate_comps(peers)
    banks = generate_bank_matrix(company, deal_type, ai_banks)
    
    # NEW: Fetch Chart Data
    history_data = get_historical_data(company)
    
    # NEW: Fetch Benchmarking Data
    benchmarking_data = []
    # Add target company first
    target_stats = get_financials(company)
    benchmarking_data.append(target_stats)
    # Add peers
    for p in peers:
        p_stats = get_financials(p)
        benchmarking_data.append(p_stats)

    result_data = {
        "analysis": analysis,
        "comps": comps,
        "banks": banks,
        "company": company,
        "deal_type": deal_type,
        "history_data": history_data,
        "benchmarking_data": benchmarking_data,
        "timestamp": datetime.utcnow()
    }
    
    # Save to MongoDB
    history_col.insert_one(result_data)
    
    # Remove _id before returning (not JSON serializable)
    if "_id" in result_data:
        del result_data["_id"]
        
    return jsonify(result_data)

@app.route('/history', methods=['GET'])
def get_history():
    rows = list(history_col.find().sort("timestamp", -1).limit(50))
    for row in rows:
        if "_id" in row:
            del row["_id"]
        # Convert datetime to string for JSON serialization
        if "timestamp" in row:
            row["timestamp"] = row["timestamp"].isoformat()
            
    return jsonify(rows)

@app.route('/download_ppt', methods=['POST'])
def download_ppt():
    data = request.json
    prs = Presentation()
    
    def add_slide(title, content):
        slide_layout = prs.slide_layouts[1]
        slide = prs.slides.add_slide(slide_layout)
        slide.shapes.title.text = title
        if hasattr(slide.placeholders[1], 'text'):
            slide.placeholders[1].text = content

    analysis = data.get('analysis', {})
    
    add_slide("Deal Overview", analysis.get('overview', 'N/A'))
    add_slide("Industry Landscape", analysis.get('industry', 'N/A'))
    
    comps_str = "Comparable Companies:\n"
    for r in data.get('comps', []):
        comps_str += " | ".join(str(x) for x in r) + "\n"
    add_slide("Valuation Comps", comps_str)
    
    add_slide("Investment Rationale", analysis.get('rationale', 'N/A'))
    add_slide("Key Risks", analysis.get('risks', 'N/A'))
    
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "pitchbook.pptx"))
    prs.save(file_path)
    
    return send_file(file_path, as_attachment=True, download_name="pitchbook.pptx")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5005))
    print(f"Backend starting on port {port}...")
    app.run(host="0.0.0.0", port=port)

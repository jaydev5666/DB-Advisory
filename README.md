# DB Advisory & Research Platform

An institutional-grade full-stack financial advisory, market intelligence, and stock scanning platform.

## Architecture Overview

- **Frontend**: Built with React 19 + Vite, featuring custom premium WebGL shaders (Molten Metal background flow), interactive spotlights, custom specular WebGL buttons, and Recharts financial visuals.
- **Backend**: Python Flask API managing real-time market data flows, authentication, competitor intelligence aggregation, and automated presentation exports.
- **Database**: MongoDB for storing user portfolio assets, wealth targets, competitor archives, and research history.

---

## Core Features

1. **Autonomous Deal Analyzer**: Generates comprehensive strategic research summaries, peer group valuation tables, and league rankings for M&A, IPO, LBO, and Restructuring deals.
2. **Dynamic Stock Charts**: Integrates yfinance and Twelve Data quotes with an automated Indian stock (.NS/.BO NSE/BSE) exchange router. Displays live currency-matched values (INR/USD) instantly.
3. **Professional Technical Screener**: Separate background-cached scanning engine calculating EMA20, EMA50, EMA200, RSI, MACD/Signal, and ADX trends for NSE equities with instant quantitative score alerts.
4. **Wealth Management Portal**: Track user assets, specify future financial goals, and invoke AI-synthesized portfolio optimization recommendations.
5. **Competitor Deal Archiving**: Real-time aggregated statistics on peer firm global ranks and recent advisory acquisitions.
6. **PPTX Export**: Compile analysis snapshots into structured client pitchbooks with one click.

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB connection string (Atlas or Local)

---

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file containing configuration keys (refer to `../.env.example` template):
   ```ini
   MONGO_URI=mongodb+srv://...
   API_KEY=your_openai_key_here
   JWT_SECRET=your_jwt_secret_here
   ```
5. Start the local server:
   ```bash
   python app.py
   ```
   *The Flask API starts on port `5005`.*

---

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `frontend/.env` file:
   ```ini
   VITE_API_BASE_URL=http://localhost:5005
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
   ```
4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## Production Configurations

### Security Best Practices
- **CORS Restricted Access**: Update `CORS_ALLOWED_ORIGINS` in production settings to your deployed domain instead of default `*`.
- **MongoDB Certificate Validation**: Set `MONGO_TLS_ALLOW_INVALID=false` in production env to strictly enforce CA certificate checks.
- **JWT Verification**: Ensure a strong random string is used for `JWT_SECRET`. The application triggers a warning during startup if default fallbacks are used.

### Standalone Screener Execution
The scanner logic is isolated inside `screener.py` for direct server-less task scheduling or cron triggers:
```bash
# Execute standalone script to output technical table directly to terminal
python screener.py
```
This runs the technical scan on the default stock set and outputs the computed data frame without starting the web server.

# Project Requirements

## Project Overview

This project is a full-stack financial advisory and market intelligence website.

- Frontend: React 19 with Vite
- Backend: Flask API
- Database: MongoDB
- Authentication: Username/password JWT auth and Google OAuth login
- Deployment target: Vercel-style frontend routing config is present
- Main domain features: company analysis, market data, news, user history, admin stats, wealth dashboard, asset tracking, goal tracking, competitor intelligence, screener, and PPT export

## Current Frontend Requirements

### Runtime

- Node.js and npm
- Vite development/build tooling

### Frontend Dependencies

The frontend dependencies are defined in `frontend/package.json`.

- `@react-oauth/google`: Google OAuth login
- `axios`: API requests
- `firebase`: Firebase SDK dependency
- `jwt-decode`: JWT token decoding
- `lucide-react`: Icon components
- `ogl`: WebGL/visual effects
- `react`: UI framework
- `react-dom`: React DOM renderer
- `react-router-dom`: Client-side routing
- `recharts`: Charts and data visualization

### Frontend Dev Dependencies

- `@eslint/js`: ESLint JavaScript rules
- `@types/react`: React type definitions
- `@types/react-dom`: React DOM type definitions
- `@vitejs/plugin-react`: Vite React plugin
- `eslint`: Linting
- `eslint-plugin-react-hooks`: React hooks linting
- `eslint-plugin-react-refresh`: React refresh linting
- `globals`: Shared global definitions for ESLint
- `vite`: Frontend build tool

### Frontend Scripts

Run these from the `frontend` directory.

- `npm run dev`: Start local frontend dev server
- `npm run build`: Build production frontend assets
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally

### Frontend Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL. Defaults to `http://localhost:5005` if not provided.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID.

### Frontend Routes

- `/`: Landing page
- `/dashboard`: Dashboard
- `/services`: Services page
- `/contact`: Contact page
- `/about`: About page
- `/screener`: Screener page
- `/detail/:type`: Detail page
- `/admin`: Admin panel
- `/wealth-portal`: Wealth dashboard

## Current Backend Requirements

### Runtime

- Python 3.x
- Flask-compatible WSGI server for production
- MongoDB database

### Backend Dependencies

The backend dependencies are defined in `backend/requirements.txt`.

- `flask`: Backend web framework
- `flask-cors`: Cross-origin request support
- `requests`: External HTTP requests
- `yfinance`: Market data fetching
- `pandas`: Data processing
- `python-pptx`: PowerPoint export generation
- `openai`: OpenAI client/library
- `gunicorn`: Production WSGI server
- `python-dotenv`: Local `.env` loading
- `pymongo`: MongoDB client
- `bcrypt`: Password hashing
- `PyJWT`: JWT creation and validation
- `flask-limiter`: API rate limiting

### Backend Dependency Used But Missing From Requirements

- `certifi`: Used in `backend/app.py` for MongoDB TLS certificate handling, but not listed in `backend/requirements.txt`.

### Backend Environment Variables

- `PORT`: Backend port. Defaults to `5005`.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign JWT tokens. Currently has an insecure fallback in code.
- `API_KEY`: AI provider API key. Supports OpenAI/OpenRouter/Gemini-style keys based on prefix logic.
- `ALPHA_VANTAGE_KEY`: Alpha Vantage market data key.
- `NEWS_API_KEY`: News API key.
- `TWELVE_DATA_KEY`: Twelve Data market data key.
- `FINNHUB_KEY`: Finnhub market data key.
- `ADMIN_EMAIL`: Default admin username/email.
- `ADMIN_PASSWORD`: Default admin password.

### Backend API Endpoints

Authentication and users:

- `POST /login`
- `POST /signup`
- `POST /google-login`

Tracking and admin:

- `POST /track-visit`
- `GET /admin/stats`

Analysis and history:

- `POST /analyze`
- `GET /history`
- `POST /download_ppt`

Market and news:

- `GET /news`
- `GET /live-quote`
- `GET /chart-data`
- `GET /market/quote`
- `GET /market/chart`
- `GET /market/ipos`
- `GET /market/movers`
- `GET /market/index`

User wealth and assets:

- `GET /api/user/assets`
- `POST /api/user/assets`
- `POST /api/user/assets/delete`
- `GET /api/user/wealth/goals`
- `POST /api/user/wealth/goals`
- `POST /api/user/wealth/goals/delete`
- `POST /api/user/wealth/advisory`

Competitor intelligence:

- `GET /api/competitors`
- `GET /api/competitors/acquisitions`

Screener:

- `POST /api/screener`

## Current Deployment Requirements

- Frontend build output should be served as a single-page app.
- `vercel.json` rewrite rules are present to route all frontend paths to `index.html`.
- Backend needs a Python hosting target that supports Flask/Gunicorn and environment variables.
- Frontend production environment must set `VITE_API_BASE_URL` to the deployed backend API URL.

## Missing Items For A Production-Ready Website

### Security

- Replace the fallback `JWT_SECRET` with a required strong production secret.
- Remove default admin credentials and require secure admin setup.
- Remove `tlsAllowInvalidCertificates=True` from MongoDB connection before production.
- Restrict CORS to approved frontend domains instead of allowing all origins.
- Add request validation for all API payloads.
- Add stricter authorization checks for admin-only endpoints.
- Add password policy rules.
- Add account lockout or abuse protection for login attempts.
- Store refresh/session behavior securely instead of relying only on localStorage.
- Add security headers such as CSP, HSTS, X-Content-Type-Options, and Referrer-Policy.
- Review external API key usage and prevent leaking keys to client-side code.
- Add dependency vulnerability scanning.

### Reliability

- Replace in-memory rate limiting with shared production storage such as Redis.
- Add health check endpoint for backend uptime monitoring.
- Add centralized error handling.
- Add structured logging.
- Add request timeout handling for all external API calls.
- Add retries or graceful fallback behavior for unstable market/news APIs.
- Add database indexes for frequently queried MongoDB collections.
- Add backup and restore strategy for MongoDB.
- Add background job handling for slow tasks such as PPT generation or heavy analysis.

### Testing

- Add backend unit tests.
- Add backend API integration tests.
- Add frontend component tests.
- Add frontend end-to-end tests for key flows.
- Add authentication tests for JWT and Google login flows.
- Add admin authorization tests.
- Add market-data fallback tests.
- Add CI pipeline to run lint, build, and tests on every push or pull request.

### Frontend Production Readiness

- Add a real root README with setup, environment, deployment, and troubleshooting instructions.
- Add loading, empty, and error states consistently across API-driven pages.
- Add accessible labels, focus states, and keyboard navigation checks.
- Add responsive QA for mobile, tablet, and desktop.
- Add production analytics only after privacy requirements are decided.
- Add frontend error monitoring.
- Fix visible text encoding issues where special characters render incorrectly.
- Audit unused dependencies such as Firebase if not actively used.
- Add route protection for authenticated pages and admin pages.

### Backend Production Readiness

- Pin Python package versions in `backend/requirements.txt`.
- Add `certifi` to backend requirements.
- Add a `.env.example` file documenting all required environment variables.
- Split the large Flask app into smaller modules or blueprints.
- Add schema validation with a library such as Pydantic, Marshmallow, or Flask request validators.
- Avoid bare `except:` blocks; log errors with useful context.
- Add pagination for history, assets, competitors, and admin data if collections grow.
- Avoid seeding production data automatically during app startup unless explicitly controlled.
- Move secrets and provider configuration into deployment-managed environment settings.

### Data And Compliance

- Add privacy policy and terms of service.
- Add consent/notice for tracking visits and using third-party APIs.
- Add data retention policy for users, history, assets, and goals.
- Add user data deletion/export workflow.
- Add financial disclaimer because the app provides market and advisory-style information.
- Review whether financial advisory, investment, and user asset features require legal/compliance approval in target markets.

### Performance

- Add frontend bundle analysis.
- Lazy-load heavy dashboard/wealth/screener views.
- Cache external market/news responses where allowed.
- Add server-side caching for repeated market and competitor requests.
- Optimize images in `frontend/public` and `frontend/src/assets`.
- Add database query indexes and monitor slow queries.

### Observability

- Add backend logging with request IDs.
- Add API latency and error-rate monitoring.
- Add frontend runtime error tracking.
- Add uptime monitoring.
- Add alerts for backend failures, MongoDB connection failures, and third-party API outages.

### DevOps

- Add production, staging, and local environment separation.
- Add CI/CD workflow.
- Add deployment runbook.
- Add rollback instructions.
- Add secrets management process.
- Add dependency update process.
- Add database migration/seed strategy.

## Suggested Priority Order

1. Security fixes: JWT secret, CORS, MongoDB TLS, admin credentials, admin authorization.
2. Environment documentation: root README and `.env.example`.
3. Dependency cleanup: pin backend versions and add missing `certifi`.
4. Production deployment clarity: frontend/backend hosting, API URL, health checks.
5. Testing and CI: lint/build/test automation.
6. Observability: logs, monitoring, alerts.
7. Compliance: privacy policy, terms, financial disclaimer, data deletion/export.


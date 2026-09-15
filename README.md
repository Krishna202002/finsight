# FinSight — Personal Finance Intelligence Platform

FinSight is a full-stack personal finance platform built on the MERN stack. It goes beyond basic expense tracking by combining multi-account management, budget tracking, MongoDB aggregation-powered analytics, CSV statement import with duplicate detection, and statistics-based smart features like recurring transaction detection, anomaly flagging, and spending forecasts.

**Live demo:** _
**API base URL:** _

---

## Why this project is more than a CRUD tracker

Most beginner expense trackers stop at "add a transaction, see a list." FinSight's backend contains real business logic:

- Multiple accounts and wallets, with transfers correctly excluded from expense analytics
- CSV statement import with row-level validation, normalization, and hash-based duplicate detection
- Recurring transaction detection using date-interval and amount-consistency analysis
- Anomaly detection using a mean + 2·standard-deviation threshold per category
- A budget engine that computes usage, remaining amount, and safe daily spend
- A composite financial health score combining savings rate, budget adherence, and expense flexibility
- MongoDB aggregation pipelines (`$match`, `$group`, `$lookup`, `$project`) powering every analytics endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas), Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| File handling | Multer, csv-parse |
| Security | express-rate-limit, CORS |
| Deployment | Render (backend), Vercel (frontend), MongoDB Atlas |

---

## Architecture

```
finsight/
├── client/                 # React frontend
├── server/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Request/response handling
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, rate limiting, errors
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # Helpers, seed script
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```

**Request lifecycle:** `HTTP request → route → middleware (auth/validation/rate-limit) → controller → service → model/database → response`

Controllers stay thin — they read the request, call a service, and return the response. Services hold the actual business rules (balance updates, duplicate detection, aggregation logic). This separation keeps route handlers readable and business logic testable independent of Express.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas account (free tier is enough) or local MongoDB instance

### Setup

```bash
git clone https://github.com/<your-username>/finsight.git
cd finsight/server
npm install
cp .env.example .env
```

Fill in `.env` with your own values:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_ACCESS_SECRET=your_random_secret
JWT_REFRESH_SECRET=a_different_random_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

Generate secure random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run the backend

```bash
npm run dev
```

Server runs at `http://localhost:5000`. Confirm it's working:
```bash
curl http://localhost:5000/api/health
```

### Seed demo data (optional but recommended)

Populates a demo user with accounts, a month of transactions (including a recurring subscription and a deliberate spending anomaly), and budgets — useful for demoing the dashboard without manually creating data.

```bash
npm run seed
```

Login with the credentials printed in the console output (`demo@finsight.com` / `demo1234` by default).

### Run the frontend

```bash
cd ../client
npm install
npm run dev
```

---

## API Reference

All endpoints except `/api/auth/register`, `/api/auth/login`, and `/api/health` require an `Authorization: Bearer <accessToken>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate and receive tokens |
| POST | `/api/auth/refresh` | Exchange refresh token for a new access token |
| POST | `/api/auth/logout` | Clear refresh token cookie |
| GET | `/api/auth/me` | Return the current authenticated user |

### Accounts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts` | Create an account (bank/cash/wallet/credit card) |
| GET | `/api/accounts` | List all active accounts for the user |
| PATCH | `/api/accounts/:id` | Update an account |
| DELETE | `/api/accounts/:id` | Deactivate an account |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions` | Create an income or expense transaction |
| GET | `/api/transactions` | List transactions, supports filtering and pagination |
| GET | `/api/transactions/:id` | Get a single transaction |
| PATCH | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| POST | `/api/transactions/transfer` | Move money between two accounts |

**Query params for `GET /api/transactions`:** `page`, `limit`, `accountId`, `category`, `type`, `startDate`, `endDate`

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/budgets` | Create a monthly category budget |
| GET | `/api/budgets` | List budgets |
| GET | `/api/budgets/progress` | Get spent/remaining/percentUsed/safeDailySpend per category |
| PATCH | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Total income, expense, net savings, savings rate |
| GET | `/api/analytics/monthly` | 12-month income/expense breakdown for a given year |
| GET | `/api/analytics/by-category` | Expense totals grouped by category |
| GET | `/api/analytics/by-account` | Income/expense totals grouped by account |
| GET | `/api/analytics/top-merchants` | Top merchants by total spend |

### Import
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/import/csv` | Upload a CSV (multipart form-data: `file`, `accountId`) with row validation and duplicate detection |

### Smart Features
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/smart/recurring` | Detect recurring transactions by merchant |
| GET | `/api/smart/anomalies` | Flag unusually large transactions per category |
| GET | `/api/smart/forecast` | Predict next month's spend via 3-month moving average |
| GET | `/api/smart/health-score` | 0–100 composite financial health score |

---

## Key Design Decisions

**Money stored as integers (paise), not floats.** JavaScript floating-point arithmetic produces rounding errors (`0.1 + 0.2 !== 0.3`). Storing ₹150.50 as `15050` and dividing by 100 only for display avoids this entirely.

**Ownership enforced at the query level, not just in application logic.** Every database query that touches user-owned data filters by `{ _id: id, userId }` together, never `{ _id: id }` alone. This makes it structurally impossible to access another user's records, even by guessing valid IDs.

**Transfers are excluded from expense/income analytics.** Moving money between your own accounts isn't spending — it's relocation. All aggregation pipelines explicitly filter `type: { $in: ['income', 'expense'] }` to keep totals accurate.

**Duplicate CSV detection via content hashing.** Each imported row generates a SHA-256 hash from its user, account, date, amount, and normalized merchant name. Re-uploading the same file is idempotent — no duplicate transactions are created.

**Anomaly threshold: mean + 2 standard deviations.** A standard, explainable statistical outlier rule, applied per category rather than globally, since a ₹5,000 transaction is normal for "rent" but anomalous for "coffee."

**Services separated from controllers.** Controllers only read the request and format the response; all business logic (balance updates, duplicate checks, aggregation, scoring) lives in the service layer, making it independently testable and keeping route handlers thin.

---

## Testing

Manual testing was performed via Postman across all endpoints, covering:
- Valid requests return expected status codes and response shapes
- Missing/invalid fields return `400` with field-level validation errors
- Unauthenticated requests return `401`
- Authenticated users cannot access another user's accounts or transactions (`404`, not data leakage)
- Re-uploading an identical CSV skips all rows as duplicates
- Transfers never appear in expense-type analytics queries
- Large transaction lists are paginated rather than returned in full

---

## What I'd Improve Next

- Rebalance account totals automatically when a transaction is edited or deleted (currently only creation adjusts balances)
- Background job queue (BullMQ) for scheduled recurring-transaction generation and notifications
- Redis caching for expensive analytics aggregations on large datasets
- Automated test suite with Jest and Supertest
- Docker Compose setup and a CI/CD pipeline
- Role-based admin dashboard with an audit-log viewer
- AI-assisted transaction categorization using the user's own historical data

---

## Author

Built by Krishna kumar  as a backend-focused learning project covering REST API design, authentication, MongoDB aggregation pipelines, and statistics-based feature engineering.

# Freight Intent Broker

A logistics RFQ (Request for Quote) lead brokerage platform connecting Vietnam exporters with global freight forwarders.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Local Development

1. **Clone and install dependencies**
```bash
cd freight-intent-broker
npm install
```

2. **Start infrastructure**
```bash
docker-compose up -d postgres redis minio
```

3. **Setup database**
```bash
# Copy env file
cp apps/api/.env.example apps/api/.env

# Generate Prisma client
cd apps/api
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed
```

4. **Start development servers**
```bash
# Terminal 1: API
cd apps/api
npm run dev

# Terminal 2: Web
cd apps/web
npm run dev
```

5. **Open in browser**
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fib.com | Password123! |
| Ops | ops@fib.com | Password123! |
| Buyer | buyer1@example.com | Password123! |
| Shipper | shipper1@export.vn | Password123! |

## 📁 Project Structure

```
freight-intent-broker/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/      # JWT + cookie auth
│   │   │   │   ├── rfqs/      # RFQ CRUD
│   │   │   │   ├── leads/     # Buyer lead access
│   │   │   │   ├── scoring/   # Rule-based scoring
│   │   │   │   ├── matching/  # Buyer matching
│   │   │   │   └── ops/       # Admin operations
│   │   │   └── prisma/
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── web/          # Next.js frontend
│       └── src/
│           └── app/
│               ├── (auth)/
│               ├── shipper/
│               ├── buyer/
│               └── ops/
│
├── packages/
│   ├── shared/       # Shared enums & constants
│   └── contracts/    # Zod schemas (FE/BE contract)
│
├── docker-compose.yml
└── nginx.conf
```

## 🔑 Key Features

### For Shippers
- Multi-step RFQ creation form
- Email OTP verification
- Status tracking

### For Buyers (Forwarders)
- Matched leads inbox
- PII reveal with quota
- Feedback submission (won/lost)

### For Ops/Admin
- RFQ review queue
- Approve/reject with reason
- Scoring breakdown view
- Buyer management

## 🛡️ Security Features

- JWT access tokens (15min) + httpOnly cookie refresh tokens
- Refresh token rotation
- OTP stored as hash, not plain
- PII separated in database
- Transaction-safe reveal (prevents race conditions)
- Quota computed from delivery records (not stored counter)
- Audit logging for all PII access

## 📊 Database Schema

See `apps/api/prisma/schema.prisma` for complete schema including:
- Users, Orgs, OrgMembers
- RFQs (with Route, Cargo, Contact relations)
- LeadScores, Matches, LeadDeliveries
- BuyerProfiles, BuyerPreferences
- Subscriptions, Entitlements
- AuditLogs, Blacklists, ApiKeys

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Services:
# - nginx: Port 80 (proxy)
# - web: Port 3000
# - api: Port 3001
# - postgres: Port 5432
# - redis: Port 6379
# - minio: Port 9000/9001
```

## 📝 API Endpoints

### Public
- `POST /rfqs` - Create RFQ
- `POST /rfqs/:id/verify-email` - Verify OTP

### Buyer (requires BUYER role)
- `GET /buyer/leads` - Get matched leads
- `POST /buyer/leads/:id/reveal` - Reveal contact
- `POST /buyer/leads/:id/feedback` - Submit feedback
- `GET /buyer/subscription` - Get quota info

### Ops (requires ADMIN/OPS role)
- `GET /ops/rfqs` - List RFQs with filters
- `POST /ops/rfqs/:id/approve` - Approve RFQ
- `POST /ops/rfqs/:id/reject` - Reject RFQ
- `POST /ops/rfqs/:id/match/run` - Run matching

## 📈 Scoring Rules (0-100)

| Rule | Score |
|------|-------|
| Corporate email | +15 |
| Free email (gmail) | -10 |
| Has ready date | +10 |
| Has volume info | +10 |
| Complete route | +15 |
| Has commodity | +5 |
| Repeated contact | -30 |
| Suspicious keywords | -20 |

## License

MIT

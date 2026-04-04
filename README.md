# BudgetLens

Personal finance analytics for Belarusian bank (Priorbank) CSV statement exports. Uses Claude AI for intelligent transaction parsing and merchant normalization.

## Features

- **AI-powered CSV parsing** — Upload your Priorbank statement, Claude extracts and normalizes all transactions
- **Merchant normalization** — Multiple raw bank descriptions mapped to clean merchant names (Gippo, Sosedi, etc.)
- **Dashboard** — Income/expense overview, spending trends, top merchants and categories
- **Transaction browser** — Filterable, searchable, paginated transaction list
- **Merchant analytics** — Ranked spending by merchant with drill-down
- **Category analytics** — Bank-provided categories with percentage breakdowns

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Recharts
- **Backend**: NestJS + TypeORM + SQLite
- **AI**: Claude API (Haiku) via `@anthropic-ai/sdk`

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Setup

```bash
# Clone the project
cd budgetlens

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env — add your Anthropic API key
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start development server (NestJS + Vite)
npm run start:dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api

### Usage

1. Open http://localhost:5173
2. Go to **Upload** page
3. Drag and drop your Priorbank CSV export (Выписка)
4. Wait for AI parsing (typically 3-5 seconds)
5. Browse your transactions on the **Dashboard**

## Production Deployment (VPS)

### Build

```bash
npm run build
```

This creates:
- `dist/server/` — compiled NestJS backend
- `dist/client/` — built React frontend

The NestJS server serves the frontend as static files in production mode.

### Environment

```bash
# Copy and edit production env
cp .env.example .env

# Required changes for VPS:
NODE_ENV=production
HOST=0.0.0.0
DB_PATH=/var/lib/budgetlens/budgetlens.db
CORS_ORIGIN=https://your-domain.com
TRUST_PROXY=true
JWT_SECRET=<generate-a-random-string>
```

### PM2

```bash
# Install PM2
npm install -g pm2

# Start
pm2 start ecosystem.config.js --env production

# Save for auto-restart
pm2 save
pm2 startup
```

### Nginx

```nginx
server {
    listen 80;
    server_name budgetlens.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # File upload size
        client_max_body_size 10M;
    }
}
```

Then add SSL:
```bash
sudo certbot --nginx -d budgetlens.yourdomain.com
```

## Project Structure

```
budgetlens/
├── server/                  NestJS backend
│   ├── main.ts              Bootstrap
│   ├── app.module.ts        Root module
│   ├── config/              Environment config
│   ├── database/            TypeORM entities + seeds
│   ├── auth/                Guards, JWT, @CurrentUser
│   ├── upload/              CSV upload + AI parse + import
│   │   └── skills/          bank-csv-parser SKILL.md
│   ├── transaction/         Transaction queries
│   ├── analytics/           Aggregation endpoints
│   ├── merchant/            CRUD + merge
│   ├── statement/           Statement management
│   ├── settings/            User settings
│   └── common/              Filters, interceptors, utils
├── src/                     React frontend
│   ├── pages/               Route pages
│   ├── components/          UI components
│   ├── hooks/               Data fetching hooks
│   ├── api/                 API client
│   └── utils/               Formatters, colors
├── .env.example             Environment template
├── ecosystem.config.js      PM2 config
└── package.json
```

## AI Cost

Each monthly statement (~150 transactions) costs approximately:
- **Claude Haiku**: ~$0.02 per parse
- **Claude Sonnet**: ~$0.15 per parse

Annual cost for 12 monthly statements: **$0.24** (Haiku)

## Multi-User (Future)

The database schema already includes `user_id` on all data tables. To enable multi-user:

1. Set `APP_MODE=multi_user` in `.env`
2. The `UserGuard` switches from auto-injecting userId=1 to JWT validation
3. Add registration/login UI (endpoints are scaffolded in AuthModule)
4. No schema changes needed

## License

Private project.

# TalentTrust Backend

Express API for the TalentTrust decentralized freelancer escrow protocol. Handles contract metadata, reputation, and integration with Stellar/Soroban.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
# Clone and enter the repo
git clone <your-repo-url>
cd talenttrust-backend

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start dev server (with hot reload)
npm run dev

# Start production server
npm start
```

## Scripts

| Script   | Description                    |
|----------|--------------------------------|
| `npm run build` | Compile TypeScript to `dist/`  |
| `npm run start` | Run production server          |
| `npm run dev`   | Run with ts-node-dev           |
| `npm test`      | Run Jest tests                 |
| `npm run lint`  | Run ESLint                     |

## Environment Variables

All configuration is managed through `src/config/` and validated at startup. Copy `.env.example` to `.env` to get started. See [docs/backend/config.md](docs/backend/config.md) for full details.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port for the Express server |
| `NODE_ENV` | `development` | Runtime environment |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Stellar Horizon API endpoint |
| `STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` | Network passphrase for signing |
| `SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` | Soroban JSON-RPC endpoint |
| `SOROBAN_CONTRACT_ID` | *(empty)* | Deployed escrow contract ID |

## Contributing

1. Fork the repo and create a branch from `main`.
2. Install deps, run tests and build: `npm install && npm test && npm run build`.
3. Open a pull request. CI runs build (and tests when present) on push/PR to `main`.

## CI/CD

GitHub Actions runs on push and pull requests to `main`:

- Install dependencies
- Build the project (`npm run build`)

Keep the build passing before merging.

## License

MIT

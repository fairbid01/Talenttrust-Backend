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
| `npm run test:coverage` | Run Jest tests with coverage report |
| `npm run lint`  | Run ESLint                     |
| `npm run security:audit`  | Fail on high/critical production dependency vulnerabilities |
| `npm run security:audit:json`  | Emit dependency audit result as JSON |
| `npm run security:remediate:dry`  | Preview dependency remediation changes |

## Dependency Security Workflow

A regular dependency vulnerability workflow is now available in CI and runtime API:

- Scheduled scan: `.github/workflows/dependency-scan.yml` runs weekly and supports manual dispatch.
- PR/release gate: `npm run security:audit` enforces the production policy (`high+` blocks).
- Runtime visibility: `GET /api/v1/security/dependencies` returns latest scan summary, policy decision, and remediation suggestions.
- Optional live refresh: add `?refresh=true` to force an immediate `npm audit`.

Full policy and threat notes are in `docs/backend/dependency-vulnerability-management.md`.

## Contributing

1. Fork the repo and create a branch from `main`.
2. Install deps, run tests and build: `npm install && npm test && npm run build`.
3. Run dependency security checks: `npm run security:audit && npm run security:remediate:dry`.
4. Open a pull request.

## CI/CD

GitHub Actions runs on push and pull requests to `main`:

- Install dependencies
- Build the project (`npm run build`)
- Run tests (`npm test`)
- Run dependency audit policy gate (`npm run security:audit`)

A dedicated scheduled workflow also runs dependency scans weekly.

## License

MIT

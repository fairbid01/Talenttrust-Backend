# TalentTrust Backend

Express API for the TalentTrust decentralized freelancer escrow protocol. Handles contract metadata, reputation, and integration with Stellar/Soroban.

## Contract Event Processing

The backend now includes a deterministic contract event processing pipeline focused on three semantics:

1. Ingestion: validate inbound event payloads before business processing.
2. Deduplication: compute a stable event identity key (`contractId:eventId:sequence`) and treat replays as idempotent duplicates.
3. Persistence: store accepted events through a repository abstraction (current implementation: in-memory).

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health |
| `POST` | `/api/v1/contracts/events` | Ingest contract event payload |
| `GET` | `/api/v1/contracts/events` | List persisted events |
| `GET` | `/api/v1/contracts` | List unique contract ids from persisted events |

### Ingestion outcomes

- `accepted` (`202`): new, valid event persisted.
- `duplicate` (`200`): replayed event already processed.
- `invalid` (`400`): payload failed validation.
- `error` (`500`): unexpected internal persistence/processing failure.

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

# Run tests with coverage (required for this task)
npm test -- --coverage

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

## Test Strategy

The test suite includes both unit and integration coverage:

1. Unit tests for validation, dedupe key construction, repository behavior, and processor semantics.
2. Integration-style tests for HTTP ingestion and persistence behavior through Express routes.
3. Failure-path tests for malformed payloads, duplicate replays, and unexpected processing errors.

Coverage thresholds are enforced in Jest at 95% for statements, branches, functions, and lines (for included modules).

## Security Notes

1. Input validation is strict at ingestion boundaries to reject malformed payloads early.
2. Replay and duplicate delivery are handled as idempotent outcomes using a deterministic dedupe key.
3. JSON body limit is constrained to reduce accidental oversized request risk.
4. Current persistence is in-memory and intended for testability and local development; production hardening should add durable storage and capacity limits.
5. Trust boundary remains the ingestion endpoint; event authenticity and signature verification are future integration concerns.

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

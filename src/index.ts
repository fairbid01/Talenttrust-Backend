import express, { Request, Response } from 'express';
import { getPaginationOptions, getPaginationMetadata } from './utils/pagination';
import { getFilterOptions, sanitizeFilters } from './utils/filtering';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Mock data for demonstration purposes
const contracts = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Contract ${i + 1}`,
  status: i % 2 === 0 ? 'active' : 'inactive',
  type: i % 3 === 0 ? 'full-time' : 'part-time',
}));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'talenttrust-backend' });
});

/**
 * @notice List all contracts with pagination and filtering support.
 * @dev This endpoint uses the newly added reusable pagination and filtering utilities.
 */
app.get('/api/v1/contracts', (req: Request, res: Response) => {
  // 1. Get and sanitize filtering options
  const allowedFilters = ['status', 'type'];
  const rawFilters = getFilterOptions(req.query, allowedFilters);
  const filters = sanitizeFilters(rawFilters);

  // 2. Filter data
  let filteredContracts = contracts;
  if (Object.keys(filters).length > 0) {
    filteredContracts = contracts.filter((contract) => {
      return Object.entries(filters).every(([key, value]) => {
        return contract[key as keyof typeof contract] === value;
      });
    });
  }

  // 3. Get pagination options
  const paginationOptions = getPaginationOptions(req.query);

  // 4. Paginate data
  const paginatedData = filteredContracts.slice(
    paginationOptions.offset,
    paginationOptions.offset + paginationOptions.limit
  );

  // 5. Generate pagination metadata
  const meta = getPaginationMetadata(
    filteredContracts.length,
    paginationOptions,
    paginatedData.length
  );

  res.json({
    contracts: paginatedData,
    meta,
  });
});

app.listen(PORT, () => {
  console.log(`TalentTrust API listening on http://localhost:${PORT}`);
});

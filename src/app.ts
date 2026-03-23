import express, { Request, Response } from 'express';

import { DependencyScanProvider, DependencyScanService } from './security/dependency-scan-service';

export function createApp(scanProvider: DependencyScanProvider = new DependencyScanService()) {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'talenttrust-backend' });
  });

  app.get('/api/v1/contracts', (_req: Request, res: Response) => {
    res.json({ contracts: [] });
  });

  /**
   * @notice Returns the latest dependency vulnerability snapshot and policy decision.
   * @dev Use `?refresh=true` to bypass in-memory cache and force a new `npm audit` execution.
   */
  app.get('/api/v1/security/dependencies', async (req: Request, res: Response) => {
    try {
      const refresh = req.query.refresh === 'true';
      const result = await scanProvider.getLatestScan(refresh);

      if (result.status === 'error') {
        res.status(503).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: `Dependency scan failed unexpectedly: ${(error as Error).message}`,
      });
    }
  });

  return app;
}

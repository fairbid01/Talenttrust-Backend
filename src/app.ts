import express, { Request, Response } from 'express';
import { ContractEventProcessor } from './contracts/processor';
import { InMemoryContractEventRepository } from './contracts/repository';
import { IngestResult, PersistedContractEvent } from './contracts/types';

interface ContractEventService {
  ingest(payload: unknown): Promise<IngestResult>;
  listEvents(): Promise<PersistedContractEvent[]>;
}

interface CreateAppOptions {
  processor?: ContractEventService;
}

/**
 * @notice Creates the HTTP application with dependency injection for testing.
 */
export function createApp(options?: CreateAppOptions) {
  const repository = new InMemoryContractEventRepository();
  const processor = options?.processor ?? new ContractEventProcessor(repository);

  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'talenttrust-backend' });
  });

  app.get('/api/v1/contracts', async (_req: Request, res: Response) => {
    const events = await processor.listEvents();
    const contracts = Array.from(new Set(events.map((event) => event.contractId))).map((contractId) => ({
      contractId,
    }));
    res.json({ contracts });
  });

  app.get('/api/v1/contracts/events', async (_req: Request, res: Response) => {
    const events = await processor.listEvents();
    res.json({ events });
  });

  app.post('/api/v1/contracts/events', async (req: Request, res: Response) => {
    try {
      const result = await processor.ingest(req.body);

      if (result.status === 'invalid') {
        res.status(400).json(result);
        return;
      }

      if (result.status === 'duplicate') {
        res.status(200).json(result);
        return;
      }

      res.status(202).json(result);
    } catch (_error) {
      res.status(500).json({ status: 'error', reason: 'Failed to process event' });
    }
  });

  return app;
}
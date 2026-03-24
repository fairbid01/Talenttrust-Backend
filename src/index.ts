import express, { Request, Response } from 'express';
import { config } from './config';

const app = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'talenttrust-backend' });
});

app.get('/api/v1/contracts', (_req: Request, res: Response) => {
  res.json({ contracts: [] });
});

app.listen(config.server.port, () => {
  console.log(
    `TalentTrust API listening on http://localhost:${config.server.port}`,
  );
});

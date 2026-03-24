import request from 'supertest';
import { createApp } from './app';
import { ContractEventProcessor } from './contracts/processor';
import { InMemoryContractEventRepository } from './contracts/repository';

function createValidEvent(overrides: Record<string, unknown> = {}) {
  return {
    contractId: 'contract-1',
    eventId: 'event-1',
    sequence: 1,
    timestamp: '2026-03-24T00:00:00.000Z',
    type: 'CONTRACT_CREATED',
    payload: { amount: '100' },
    ...overrides,
  };
}

describe('app integration', () => {
  it('returns health status', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'talenttrust-backend' });
  });

  it('accepts a new event and persists it', async () => {
    const repository = new InMemoryContractEventRepository();
    const app = createApp({ processor: new ContractEventProcessor(repository) });

    const ingestResponse = await request(app)
      .post('/api/v1/contracts/events')
      .send(createValidEvent());

    expect(ingestResponse.status).toBe(202);
    expect(ingestResponse.body.status).toBe('accepted');
    expect(ingestResponse.body.eventKey).toBe('contract-1:event-1:1');

    const eventsResponse = await request(app).get('/api/v1/contracts/events');
    expect(eventsResponse.status).toBe(200);
    expect(eventsResponse.body.events).toHaveLength(1);
    expect(eventsResponse.body.events[0].eventKey).toBe('contract-1:event-1:1');
  });

  it('marks replayed event as duplicate', async () => {
    const repository = new InMemoryContractEventRepository();
    const app = createApp({ processor: new ContractEventProcessor(repository) });
    const event = createValidEvent();

    const first = await request(app).post('/api/v1/contracts/events').send(event);
    const second = await request(app).post('/api/v1/contracts/events').send(event);

    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ status: 'duplicate', eventKey: 'contract-1:event-1:1' });
  });

  it('rejects malformed payloads', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/contracts/events').send({
      contractId: '',
      payload: 'invalid',
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('invalid');
  });

  it('returns contract ids from persisted events', async () => {
    const repository = new InMemoryContractEventRepository();
    const app = createApp({ processor: new ContractEventProcessor(repository) });

    await request(app).post('/api/v1/contracts/events').send(createValidEvent());
    await request(app).post('/api/v1/contracts/events').send(createValidEvent({ eventId: 'event-2', sequence: 2 }));
    await request(app)
      .post('/api/v1/contracts/events')
      .send(createValidEvent({ contractId: 'contract-2', eventId: 'event-3', sequence: 1 }));

    const response = await request(app).get('/api/v1/contracts');

    expect(response.status).toBe(200);
    expect(response.body.contracts).toEqual([{ contractId: 'contract-1' }, { contractId: 'contract-2' }]);
  });

  it('returns a 500 when processor throws unexpectedly', async () => {
    const app = createApp({
      processor: {
        ingest: async () => {
          throw new Error('database unavailable');
        },
        listEvents: async () => [],
      },
    });

    const response = await request(app).post('/api/v1/contracts/events').send(createValidEvent());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: 'error', reason: 'Failed to process event' });
  });
});

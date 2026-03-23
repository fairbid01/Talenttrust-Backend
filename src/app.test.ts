import request from 'supertest';

import { createApp } from './app';
import { DependencyScanProvider } from './security/dependency-scan-service';
import { DependencyScanResult } from './security/dependency-types';

class MockScanProvider implements DependencyScanProvider {
  public latestForceRefresh?: boolean;

  public constructor(private readonly result: DependencyScanResult) {}

  public async getLatestScan(forceRefresh?: boolean): Promise<DependencyScanResult> {
    this.latestForceRefresh = forceRefresh;
    return this.result;
  }
}

class ThrowingProvider implements DependencyScanProvider {
  public async getLatestScan(): Promise<DependencyScanResult> {
    throw new Error('runtime explosion');
  }
}

describe('app integration', () => {
  it('returns health status payload', async () => {
    const app = createApp(
      new MockScanProvider({
        status: 'error',
        scannedAt: '2026-01-01T00:00:00.000Z',
        policy: {
          failOn: 'high',
          includeDevDependencies: false,
        },
        message: 'not used in this test',
      }),
    );

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'talenttrust-backend',
    });
  });

  it('returns contracts payload', async () => {
    const app = createApp(
      new MockScanProvider({
        status: 'error',
        scannedAt: '2026-01-01T00:00:00.000Z',
        policy: {
          failOn: 'high',
          includeDevDependencies: false,
        },
        message: 'not used in this test',
      }),
    );

    const response = await request(app).get('/api/v1/contracts');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ contracts: [] });
  });

  it('returns dependency scan result', async () => {
    const provider = new MockScanProvider({
      status: 'ok',
      scannedAt: '2026-01-01T00:00:00.000Z',
      policy: {
        failOn: 'high',
        includeDevDependencies: false,
      },
      summary: {
        source: 'npm-audit',
        total: 0,
        counts: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
        },
        issues: [],
      },
      evaluation: {
        passed: true,
        blockingCounts: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
        },
        reason: 'No policy-blocking vulnerabilities found.',
      },
      remediation: ['npm audit --omit=dev'],
    });

    const app = createApp(provider);
    const response = await request(app).get('/api/v1/security/dependencies?refresh=true');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.evaluation.passed).toBe(true);
    expect(provider.latestForceRefresh).toBe(true);
  });

  it('surfaces scanner errors with 503', async () => {
    const app = createApp(
      new MockScanProvider({
        status: 'error',
        scannedAt: '2026-01-01T00:00:00.000Z',
        policy: {
          failOn: 'high',
          includeDevDependencies: false,
        },
        message: 'audit failed',
      }),
    );

    const response = await request(app).get('/api/v1/security/dependencies');

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('audit failed');
  });

  it('returns 503 on unexpected scanner exceptions', async () => {
    const app = createApp(new ThrowingProvider());

    const response = await request(app).get('/api/v1/security/dependencies');

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('runtime explosion');
  });
});


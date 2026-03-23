import app from './index';

describe('index bootstrap', () => {
  it('exports an express app instance', () => {
    expect(app).toBeDefined();
  });
});

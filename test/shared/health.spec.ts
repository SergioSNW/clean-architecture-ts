import { checkHealth } from '../../src/shared/health';

describe('checkHealth', () => {
  it('should return OK and a timestamp', () => {
    const result = checkHealth();

    expect(result).toMatch(/^OK - \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

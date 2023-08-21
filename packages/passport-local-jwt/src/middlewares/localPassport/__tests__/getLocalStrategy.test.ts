import { Strategy as LocalStrategy } from 'passport-local';
import { getLocalStrategy } from '../getLocalStrategy';

describe(`${getLocalStrategy.name} strategy`, () => {
  test('should have local name and return strategy object', async () => {
    const mockVerify = jest.fn();
    const strategy = getLocalStrategy({
      secret: 'secret',
      verify: mockVerify,
      options: { session: false },
    });

    expect(strategy.name).toEqual('local');
    expect(strategy).toEqual(expect.any(LocalStrategy));
  });
});

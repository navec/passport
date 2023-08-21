import { Request, Response } from 'express';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  getLocalStrategy,
  localAuthenticate,
  verifyFunction,
} from '../localPassport';

const mockLoginUser = jest.fn();
jest.mock('../../entities/User', () => ({
  loginUser: (email: string, pwd: string) => mockLoginUser(email, pwd),
}));

const mockSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: (user: any, secret: string, options: any) => {
    return mockSign(user, secret, options);
  },
}));

describe('LocalPassport middlewares', () => {
  describe(`${verifyFunction.name} function`, () => {
    const mockDone = jest.fn();
    const options = {
      req: {} as Request,
      username: 'john.doe@example.com',
      password: 'change_me',
      secret: 'secret',
      done: mockDone,
    };

    afterEach(() => jest.clearAllMocks());

    test('should return user with token', () => {
      mockLoginUser.mockReturnValueOnce({ email: 'john.doe@example.com' });
      mockSign.mockReturnValueOnce('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

      verifyFunction(options);

      expect(mockLoginUser).toBeCalledWith('john.doe@example.com', 'change_me');
      expect(mockSign).toBeCalledWith(
        { email: 'john.doe@example.com' },
        'secret',
        { expiresIn: '1h' }
      );
      expect(mockDone).toBeCalledWith(null, {
        email: 'john.doe@example.com',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });
    });

    test('should throw authorization required when user is undefined', () => {
      mockLoginUser.mockReturnValueOnce(undefined);

      verifyFunction(options);

      expect(mockLoginUser).toBeCalledWith('john.doe@example.com', 'change_me');
      expect(mockDone).toBeCalledWith(null, false, {
        message: 'Email or password is not correct',
      });
    });

    test('should throw a custom message when an error occurs.', () => {
      mockLoginUser.mockReturnValueOnce({ email: 'john.doe@example.com' });
      mockSign.mockImplementationOnce(() => {
        throw new Error('custom message');
      });

      verifyFunction(options);

      expect(mockLoginUser).toBeCalledWith('john.doe@example.com', 'change_me');
      expect(mockSign).toBeCalledWith(
        { email: 'john.doe@example.com' },
        'secret',
        { expiresIn: '1h' }
      );
      expect(mockDone).toHaveBeenCalledWith(new Error('custom message'));
    });
  });

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

      //     passport.use(strategy);
      //     // strategy.error = jest.fn();
      //     // // try {
      //     strategy.authenticate(req, mockDone);
      //     // // } catch (error) {}
      //     // expect(strategy.name).toEqual('local');
      //     // expect(mockLoginUser).toBeCalledWith('john.doe@example.com', 'change_me');
      //     // expect(mockSign).toBeCalledWith(
      //     //   { email: 'john.doe@example.com' },
      //     //   'secret',
      //     //   { expiresIn: '1h' }
      //     // );
      //     // expect(mockDone).toBeCalledWith(null);
    });
  });

  describe(`${localAuthenticate.name} middleware strategy`, () => {
    test('should return 401 with missing credentials when no credentials are send', () => {
      const req = {} as Request;
      const [mockStatus, mockSend] = [jest.fn().mockReturnThis(), jest.fn()];
      const res = { status: mockStatus, send: mockSend } as unknown as Response;
      const mockNext = jest.fn();
      const next = mockNext;

      localAuthenticate({ secret: 'secret', name: 'local', req, res, next });

      expect(mockStatus).toBeCalledWith(401);
      expect(mockSend).toBeCalledWith('Missing credentials');
      expect(mockNext).toBeCalledWith();
    });

    test('should return 401 with incorrect identification when no user found', () => {
      const req = {
        body: { email: 'john.doe@example.com', password: 'change_me' },
      } as Request;
      const [mockStatus, mockSend] = [jest.fn().mockReturnThis(), jest.fn()];
      const res = { status: mockStatus, send: mockSend } as unknown as Response;
      const mockNext = jest.fn();
      const next = mockNext;
      mockLoginUser.mockReturnValueOnce(undefined);

      localAuthenticate({ secret: 'secret', name: 'local', req, res, next });

      expect(mockStatus).toBeCalledWith(401);
      expect(mockSend).toBeCalledWith('Email or password is not correct');
      expect(mockNext).toBeCalledWith();
    });

    test('should return 500 with incorrect identification when no user found', () => {
      const req = {
        body: { email: 'john.doe@example.com', password: 'change_me' },
      } as Request;
      const [mockStatus, mockSend] = [jest.fn().mockReturnThis(), jest.fn()];
      const res = { status: mockStatus, send: mockSend } as unknown as Response;
      const mockNext = jest.fn();
      const next = mockNext;
      mockLoginUser.mockImplementation(() => {
        throw new Error('message');
      });

      localAuthenticate({ secret: 'secret', name: 'local', req, res, next });

      expect(mockNext).toBeCalledWith(new Error('message'));
    });

    test('should add user in request object', () => {
      const req = {
        body: { email: 'test@example.com', password: 'change_me' },
      } as Request;
      const res = {} as unknown as Response;
      const mockNext = jest.fn();
      const next = mockNext;
      mockLoginUser.mockReturnValueOnce({ email: 'test@example.com' });
      mockSign.mockReturnValueOnce('token');

      localAuthenticate({ secret: 'secret', name: 'local', req, res, next });

      expect(req.user).toEqual({ email: 'test@example.com', token: 'token' });
      expect(mockNext).toBeCalledWith();
    });
  });
});

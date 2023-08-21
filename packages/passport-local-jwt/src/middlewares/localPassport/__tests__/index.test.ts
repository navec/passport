import { Request, Response } from 'express';
import { localAuthenticate } from '..';

const mockLoginUser = jest.fn();
jest.mock('../../../entities/User', () => ({
  loginUser: (email: string, pwd: string) => mockLoginUser(email, pwd),
}));

const mockSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: (user: any, secret: string, options: any) => {
    return mockSign(user, secret, options);
  },
}));

describe(`${localAuthenticate.name} middleware`, () => {
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

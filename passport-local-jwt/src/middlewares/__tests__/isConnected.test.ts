import { Request, Response } from 'express';
import { isConnected } from '../isConnected';

const USER = {
  avatar: null,
  email: 'fake@email.com',
  userId: '&',
  username: 'Prenom Nom',
  birthdate: '1992/10/20',
  registeredAt: '2020/01/01',
};
const AUTHORIZATION = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const getMockRequest = (req?: Request | any) => ({ ...req } as Request);
const getMockResponse = () => {
  return {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
};

const mockVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  default: {
    verify: (token: string, secret: string) => mockVerify(token, secret),
  },
}));

const mockGetUserByEmail = jest.fn();
jest.mock('../../entities/User', () => ({
  getUserByEmail: (email: string) => mockGetUserByEmail(email),
}));

describe(`${isConnected.name} middleware`, () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 401 and authentification required when no authorization sent', () => {
    const req = getMockRequest();
    const res = getMockResponse();
    const next = jest.fn();

    isConnected('secret')(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledWith(401);
    expect(res.json).toBeCalledWith({
      message: 'Authentification is required',
    });
  });

  test('should return 401 and authentification required when no users found', () => {
    const req = getMockRequest({ headers: { authorization: AUTHORIZATION } });
    const res = getMockResponse();
    const next = jest.fn();
    mockVerify.mockReturnValueOnce({ email: 'fake@email.com' });
    mockGetUserByEmail.mockReturnValueOnce(undefined);

    isConnected('secret')(req, res, next);

    expect(next).not.toBeCalled();
    expect(req.user).toEqual(undefined);
    expect(res.status).toBeCalledWith(401);
    expect(res.json).toBeCalledWith({
      message: 'Authentification is required',
    });
  });

  test('should call the following middleware', () => {
    const req = getMockRequest({ headers: { authorization: AUTHORIZATION } });
    const res = getMockResponse();
    const next = jest.fn();
    mockVerify.mockReturnValueOnce({ email: 'fake@email.com' });
    mockGetUserByEmail.mockReturnValueOnce(USER);

    isConnected('secret')(req, res, next);

    expect(next).toBeCalled();
    expect(req.user).toEqual({
      avatar: null,
      birthdate: '1992/10/20',
      email: 'fake@email.com',
      registeredAt: '2020/01/01',
      userId: '&',
      username: 'Prenom Nom',
    });
  });
});

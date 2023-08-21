import { Request } from 'express';
import { verifyFunction } from '../verifyFunction';

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

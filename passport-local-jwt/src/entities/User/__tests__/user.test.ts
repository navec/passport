import { getUserByEmail, loginUser } from '../index';

jest.mock('../data', () => ({
  USER_DATA: {
    'fake@email.com': {
      userId: '&',
      username: 'Prenom Nom',
      email: 'fake@email.com',
      avatar: null,
      password: 'my_password',
      birthdate: '1992/10/20',
      registeredAt: '2020/01/01',
    },
  },
}));

describe('User entity', () => {
  describe(`${loginUser.name} function`, () => {
    test('should return user', () => {
      const user = loginUser('fake@email.com', 'my_password');

      expect(user).toEqual({
        avatar: null,
        email: 'fake@email.com',
        userId: '&',
        username: 'Prenom Nom',
      });
    });

    test('should throw error when password is wrong', () => {
      const loginUserCb = () => loginUser('fake@email.com', 'wrong');
      expect(loginUserCb).toThrow('Email or password is not correct');
    });

    test('should throw error when email and password are wrong', () => {
      const loginUserCb = () => loginUser('other@email.com', 'wrong');
      expect(loginUserCb).toThrow('Email or password is not correct');
    });
  });

  describe(`${getUserByEmail.name} function`, () => {
    test('should return user', () => {
      const user = getUserByEmail('fake@email.com');

      expect(user).toEqual({
        avatar: null,
        email: 'fake@email.com',
        userId: '&',
        username: 'Prenom Nom',
        birthdate: '1992/10/20',
        registeredAt: '2020/01/01',
      });
    });

    test('should throw error when email and password are wrong', () => {
      const user = getUserByEmail('other@email.com');
      expect(user).toBeUndefined();
    });
  });
});

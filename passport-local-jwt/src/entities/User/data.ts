import { DbUser } from './type';

export const USER_DATA: Record<string, DbUser> = {
  'john.doe@example.com': {
    userId: '1234_john_doe_user_id',
    username: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    password: 'change_me',
    birthdate: '1992/10/20',
    registeredAt: '2020/01/01',
  },
};

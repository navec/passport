import { USER_DATA } from './data';
import { DbUser, PublicUser, User } from './type';

const dbUserToUser = ({ password, ...user }: DbUser): User => user;
const userToPublicUser = ({ userId, username, email, avatar }: User) => {
  return { userId, username, email, avatar };
};

export const loginUser = (
  email: string,
  password: string
): PublicUser | undefined => {
  const dbUser = USER_DATA[email];

  const isValidUser = dbUser && dbUser.password === password;
  return isValidUser ? userToPublicUser(dbUser) : undefined;
};

export const getUserByEmail = (email: string): User | undefined => {
  return USER_DATA[email] ? dbUserToUser(USER_DATA[email]) : undefined;
};

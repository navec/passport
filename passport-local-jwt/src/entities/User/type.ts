export type DbUser = {
  userId: string;
  username: string;
  email: string;
  avatar: null;
  password: string;
  birthdate: string;
  registeredAt: string;
};

export type User = Omit<DbUser, 'password'>;
export type PublicUser = Omit<User, 'birthdate' | 'registeredAt'>;

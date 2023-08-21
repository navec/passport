import jwt from 'jsonwebtoken';
import { IVerifyOptions } from 'passport-local';
import { loginUser } from '../../entities/User';

export type VerifyFunctionParams = {
  username: string;
  password: string;
  done: (
    error: any,
    user?: Express.User | false,
    options?: IVerifyOptions
  ) => void;
  secret: string;
};

export const verifyFunction = (options: VerifyFunctionParams) => {
  const { username, password, done, secret } = options;
  try {
    // Trouver l'utilisateur grace à son email et mot de passe
    const user = loginUser(username, password);

    if (!user) {
      // Retourne un message fonctionnel
      return done(null, false, { message: 'Email or password is not correct' });
    }

    // Générer un token
    const token = jwt.sign(user, secret, { expiresIn: '1h' });

    // Retourner l'utilisateur avec un token
    return done(null, { ...user, token });
  } catch (error) {
    return done(error);
  }
};

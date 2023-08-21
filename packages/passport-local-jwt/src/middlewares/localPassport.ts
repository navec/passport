import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {
  IStrategyOptions,
  IVerifyOptions,
  Strategy as LocalStrategy,
} from 'passport-local';
import { loginUser } from '../entities/User';
import { PublicUser } from '../entities/User/type';

type VerifyFunctionParams = {
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

type GetLocalStrategyParams = {
  secret: string;
  verify: (options: VerifyFunctionParams) => void;
  options?: IStrategyOptions;
};
export const getLocalStrategy = ({
  secret,
  verify,
  options,
}: GetLocalStrategyParams) => {
  return new LocalStrategy(
    { usernameField: 'email', ...options },
    (username, password, done) => verify({ username, password, done, secret })
  );
};

const authenticateCb = (next: NextFunction, res: Response, req: Request) => {
  return (
    err: Error,
    user: PublicUser & { token: string },
    info: { message: string }
  ) => {
    // Retourne l'erreur
    if (err) next(err);

    // Ajouter le user dans la requete
    if (user) req.user = user;

    // Return status non autorisé avec un message fonctionnel
    if (info) res.status(401).send(info.message);

    // Passer à l'étape suivante
    next();
  };
};

type LocalAuthenticateParams = {
  secret: string;
  name?: string;
  req: Request;
  res: Response;
  next: NextFunction;
};
export const localAuthenticate = ({
  req,
  res,
  next,
  secret,
  name = 'local',
}: LocalAuthenticateParams) => {
  // Récupérer la strategy de passport
  const strategy = getLocalStrategy({ secret, verify: verifyFunction });

  // Utiliser la strategy
  passport.use(name, strategy);

  // Retourner la stratégie (passport-local)
  return passport.authenticate(
    name,
    { session: false },
    authenticateCb(next, res, req)
  )(req, res, next);
};

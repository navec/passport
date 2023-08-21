import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { PublicUser } from '../../entities/User/type';
import { getLocalStrategy } from './getLocalStrategy';
import { verifyFunction as verify } from './verifyFunction';

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
  const strategy = getLocalStrategy({ secret, verify });

  // Utiliser la strategy
  passport.use(name, strategy);

  // Retourner la stratégie (passport-local)
  return passport.authenticate(
    name,
    { session: false },
    (
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
    }
  )(req, res, next);
};

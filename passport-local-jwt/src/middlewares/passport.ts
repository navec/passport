import jwt from 'jsonwebtoken';
import passport from 'passport';
import {
  IStrategyOptionsWithRequest,
  Strategy as LocalStrategy,
} from 'passport-local';
import { loginUser } from '../entities/User';

type LocalAuthenticateParams = Omit<
  IStrategyOptionsWithRequest,
  'passReqToCallback'
> & {
  secret: string;
  name?: string;
};

/**
 * Authentification avec email et mot de passe
 *
 * @param {LocalAuthenticateParams} {
  secret,
  name = "local",
  ...options
}
 * @returns Un utilisateur avec un token et sans mot de passe 
 */
export const localAuthenticate = ({
  secret,
  name = 'local',
  ...options
}: LocalAuthenticateParams) => {
  passport.use(
    name,
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true, ...options },
      (req, username, password, done) => {
        // Trouver l'utilisateur grace à son email et mot de passe
        const user = loginUser(username, password);

        // Générer un token
        const token = jwt.sign(user, secret, { expiresIn: '1h' });

        // Ajouter les informations de l'utilisateur dans la requete
        req.user = user;

        // Retourner l'utilisateur avec un token
        return done(null, { ...user, token });
      }
    )
  );

  // Retourner la stratégie (passport-local)
  return passport.authenticate(name, { session: false });
};

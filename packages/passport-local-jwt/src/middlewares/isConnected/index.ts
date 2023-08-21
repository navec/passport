import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../entities/User';
import { PublicUser } from '../../entities/User/type';

/**
 * On vérifie que le jeton est bien valide.
 *
 * @param {string} secret
 * @returns Thrown une exception ou valide le jeton
 */
export const isConnected =
  (secret: string) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Vérifie que l'Authorization est envoyé dans le header
      const authorization = req.headers?.authorization;
      if (!authorization) {
        throw new Error('Authorization is require');
      }

      // Verifie que le jeton est valide
      const { email } = jwt.verify(authorization, secret) as PublicUser;

      // Récupérer les informations de l'utilisateur et le mettre dans le Request.User
      const user = getUserByEmail(email);
      if (!user) {
        throw new Error('User does not exist');
      }
      req.user = user;
      // Passer au middleware suivant
      return next();
    } catch (error) {
      // Logger la vrai erreur puis retourner l'erreur fonctionnelle avec un code 401
      return res.status(401).json({ message: 'Authentification is required' });
    }
  };

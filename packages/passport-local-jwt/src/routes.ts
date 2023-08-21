import express from 'express';
import { User } from './entities/User/type';
import { isConnected, localAuthenticate } from './middlewares';

const secret = process.env.SECRET || 'secret';
const userRouter = express.Router();

console.log(new Date(), '[Routes] UserRoute {}:');

// Recupère les informations de l'utilisateur avec le token
userRouter.post(
  '/login',
  (req, res, next) => localAuthenticate({ secret, req, res, next }),
  (req, res) => res.send(req.user)
);
console.log(new Date(), '[Routes] Mapped {/login, POST} route');

// Recupère les informations de l'utilisateur
userRouter.get('/user/:id', isConnected(secret), (req, res) => {
  const user = req.user as User;
  const isValidId = user.userId === req.params?.id;
  if (isValidId) {
    return res.send(req.user);
  }
  return res.status(404).send('User not found');
});
console.log(new Date(), '[Routes] Mapped {/user/:id, GET} route\n');
export { userRouter };

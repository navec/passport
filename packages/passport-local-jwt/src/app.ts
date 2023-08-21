import 'dotenv/config';
import express from 'express';
import { userRouter } from './routes';

const port = process.env.PORT || 3030;

const app = express();
app.use(express.json());

// Routes
app.use(userRouter);

export default app;

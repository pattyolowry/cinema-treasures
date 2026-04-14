import express from 'express';
import middleware from '../utils/middleware';
import historyRouter from '../routes/history';
import userRouter from '../routes/users';
import treasureRouter from '../routes/treasures';
import awardRouter from '../routes/awards';
import tmdbRouter from '../routes/tmdb';
import healthRouter from '../routes/health';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://www.cinematreasures.club',
  'https://cinematreasures.club'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// Routes
app.use('/health', healthRouter);
app.use('/', middleware.apiLimiter);
app.use('/history', historyRouter);
app.use('/users', userRouter);
app.use('/treasures', treasureRouter);
app.use('/awards', awardRouter);
app.use('/tmdb', tmdbRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
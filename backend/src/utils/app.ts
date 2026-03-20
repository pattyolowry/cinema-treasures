import express from 'express';
import middleware from '../utils/middleware'
import historyRouter from '../routes/history';
import userRouter from '../routes/users';
import treasureRouter from '../routes/treasures';
import awardRouter from '../routes/awards'
import tmdbRouter from '../routes/tmdb'
import healthRouter from '../routes/health'
import connectToDatabase from '../utils/db';
import config from '../utils/config';


const app = express();

connectToDatabase(config.MONGODB_URI);

app.set('trust proxy', 1);
app.use(express.json());
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/health', healthRouter);

app.use('/api', middleware.apiLimiter)
app.use('/api/history', historyRouter);
app.use('/api/users', userRouter);
app.use('/api/treasures', treasureRouter);
app.use('/api/awards', awardRouter);
app.use('/api/tmdb', tmdbRouter);

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app;
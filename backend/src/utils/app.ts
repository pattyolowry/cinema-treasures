import express from 'express';
import middleware from '../utils/middleware'
import historyRouter from '../routes/history';
import userRouter from '../routes/users';
import connectToDatabase from '../utils/db';
import config from '../utils/config'

const app = express();

connectToDatabase(config.MONGODB_URI);

app.use(express.json());
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use('/history', historyRouter);
app.use('/users', userRouter);

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app;
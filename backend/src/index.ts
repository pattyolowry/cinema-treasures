import historyRouter from './routes/history';
import userRouter from './routes/users';
import connectToDatabase from './utils/db';
import config from './utils/config'
import app from './utils/app'


connectToDatabase(config.MONGODB_URI);

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use('/history', historyRouter);
app.use('/users', userRouter);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
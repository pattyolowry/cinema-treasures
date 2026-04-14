import config from './utils/config';
import app from './utils/app';
import connectToDatabase from './utils/db';

const start = async () => {
  try {
    await connectToDatabase(config.MONGODB_URI);
    app.listen(config.PORT as number, '0.0.0.0', () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
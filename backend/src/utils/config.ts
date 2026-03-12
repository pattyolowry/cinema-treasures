import 'dotenv/config';

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("MONGO_URI environment variable is not defined")
}

export default { MONGODB_URI, PORT }
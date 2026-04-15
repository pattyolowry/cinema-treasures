import 'dotenv/config';

const PORT = process.env.PORT || 3003;
const ADMIN_USER = process.env.ADMIN_USER;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI;

const JWT_SECRET = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_JWT_SECRET
  : process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export default { MONGODB_URI, PORT, JWT_SECRET, ADMIN_USER, TMDB_API_KEY };
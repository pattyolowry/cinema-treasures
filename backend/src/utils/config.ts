import 'dotenv/config';

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_USER = process.env.ADMIN_USER
const TMDB_API_KEY = process.env.TMDB_API_KEY

if (!MONGODB_URI) {
  throw new Error("MONGO_URI environment variable is not defined")
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined")
}

export default { MONGODB_URI, PORT, JWT_SECRET, ADMIN_USER, TMDB_API_KEY }
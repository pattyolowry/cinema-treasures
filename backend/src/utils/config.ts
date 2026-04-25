import "dotenv/config";

const PORT = process.env.PORT || 3003;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const AWS_REGION = process.env.AWS_REGION;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const JWT_SECRET =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_JWT_SECRET
    : process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export default {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  TMDB_API_KEY,
  AWS_REGION,
  SQS_QUEUE_URL,
};

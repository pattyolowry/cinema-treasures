import { SQSEvent, SQSRecord } from "aws-lambda";
import { z } from "zod";
import connectToDatabase from "../utils/db";
import config from "../utils/config";

let dbIsConnected = false;

const jobSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HISTORY_ADDED"),
    movieId: z.string(),
  }),
  z.object({
    type: z.literal("TREASURE_ADDED"),
    user: z.string(),
    movieId: z.string(),
  }),
]);

const connectDB = async () => {
  if (dbIsConnected) {
    return;
  }
  await connectToDatabase(config.MONGODB_URI);

  dbIsConnected = true;
};

export const movieHandler = async (event: SQSEvent) => {
  await connectDB();

  for (const record of event.Records) {
    const body = parseBody(record);

    console.log(body.type);
  }
};

function parseBody(record: SQSRecord) {
  return jobSchema.parse(JSON.parse(record.body));
}

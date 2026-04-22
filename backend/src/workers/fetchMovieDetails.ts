import { SQSEvent, SQSRecord } from "aws-lambda";
import { z } from "zod";

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

function parseBody(record: SQSRecord) {
  return jobSchema.parse(JSON.parse(record.body));
}

export const movieHandler = (event: SQSEvent) => {
  for (const record of event.Records) {
    const body = parseBody(record);
    console.log(body.type);
  }
};

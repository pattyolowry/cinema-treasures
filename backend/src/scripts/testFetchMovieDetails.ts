import { movieHandler } from "../workers/fetchMovieDetails";
import type { SQSEvent } from "aws-lambda";
import mongoose from "mongoose";

const main = async () => {
  await movieHandler({
    Records: [
      {
        body: JSON.stringify({
          type: "HISTORY_ADDED",
          movieId: "69b8a1621ed6b9380318323b",
        }),
      },
    ],
  } as unknown as SQSEvent);

  console.log("Event processed, closing MongoDB connection");
  await mongoose.connection.close();
};

main().catch(console.error);

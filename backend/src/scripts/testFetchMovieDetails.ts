import { movieHandler } from "../workers/fetchMovieDetails";
import type { SQSEvent } from "aws-lambda";
import mongoose from "mongoose";

const main = async () => {
  await movieHandler({
    Records: [
      {
        body: JSON.stringify({
          type: "TREASURE_ADDED",
          user: "Quinn",
          movieId: "69f126df483e3461d16f4a6f",
          troveId: "69f126df483e3461d16f4a71",
        }),
      },
    ],
  } as unknown as SQSEvent);

  console.log("Event processed, closing MongoDB connection");
  await mongoose.connection.close();
};

main().catch(console.error);

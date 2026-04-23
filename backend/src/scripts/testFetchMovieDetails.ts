import { movieHandler } from "../workers/fetchMovieDetails";
import type { SQSEvent } from "aws-lambda";
import mongoose from "mongoose";

const main = async () => {
  await movieHandler({
    Records: [
      {
        body: JSON.stringify({
          type: "TREASURE_ADDED",
          user: "Patio",
          movieId: "69b47254e4360a983c3adb29",
        }),
      },
    ],
  } as unknown as SQSEvent);

  console.log("Event processed, closing MongoDB connection");
  await mongoose.connection.close();
};

main().catch(console.error);

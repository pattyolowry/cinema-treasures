import { movieHandler } from "../workers/fetchMovieDetails";
import type { SQSEvent } from "aws-lambda";
import mongoose from "mongoose";

const main = async () => {
  await movieHandler({
    Records: [
      {
        body: JSON.stringify({
          type: "TREASURE_UPDATED",
          user: "Patio",
          movieId: "69c1e70d15ab05d3e9cf7c57",
          troveId: "69c1e70d15ab05d3e9cf7c59",
          old: {
            ratings: [
              { user: "Ren", rating: 10 },
              { user: "Patio", rating: 10 },
              { user: "Greg", rating: 10 },
              { user: "Max", rating: 10 },
              { user: "Quinn", rating: 10 },
            ],
          },
          new: {
            ratings: [
              { user: "Ren", rating: 10 },
              { user: "Patio", rating: 10 },
              { user: "Greg", rating: 10 },
              { user: "Max", rating: 10 },
              { user: "Quinn", rating: 10 },
            ],
          },
        }),
      },
    ],
  } as unknown as SQSEvent);

  console.log("Event processed, closing MongoDB connection");
  await mongoose.connection.close();
};

main().catch(console.error);

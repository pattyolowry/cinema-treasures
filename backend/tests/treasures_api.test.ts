import { test, before, after, beforeEach, describe } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/utils/app";
import connectToDatabase from "../src/utils/db";
import Treasure from "../src/models/treasure";
import Movie from "../src/models/movie";
import User from "../src/models/user";
import config from "../src/utils/config";
//import assert from "node:assert";
import bcrypt from "bcrypt";

const api = supertest(app);

const initialEntries = [
  {
    movie: {
      title: "Eyes Wide Shut",
      yearReleased: 1999,
      originCountry: "United Kingdom",
      runTime: 160,
      posterUrl:
        "https://image.tmdb.org/t/p/w154/mavrhr0ig2aCRR8d48yaxtD5aMQ.jpg",
    },
    ratings: [
      {
        user: "Ren",
        rating: 10,
      },
      {
        user: "Patio",
        rating: 7,
      },
      {
        user: "Max",
        rating: 7,
      },
    ],
    ctcstm: 7.6,
  },
  {
    movie: {
      title: "12 Angry Men",
      yearReleased: 1957,
      originCountry: "United States of America",
      runTime: 97,
      posterUrl:
        "https://image.tmdb.org/t/p/w154/2QXLVh32JKaWTjFJU3n8aIxRK9P.jpg",
    },
    ratings: [
      {
        user: "Ren",
        rating: 10,
      },
      {
        user: "Patio",
        rating: 9,
      },
      {
        user: "Greg",
        rating: 10,
      },
      {
        user: "Max",
        rating: 10,
      },
      {
        user: "Quinn",
        rating: 9,
      },
    ],
    ctcstm: 9.6,
  },
];

before(async () => {
  await connectToDatabase(config.MONGODB_URI);
  await User.deleteMany({});
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash("testpassword", saltRounds);

  const userObject = new User({
    name: "Test User 1",
    username: "testuser1",
    passwordHash: passwordHash,
  });

  await userObject.save();
});

describe("When there are initially some trove entries saved", () => {
  beforeEach(async () => {
    await Movie.deleteMany({});
    await Treasure.deleteMany({});

    for (const entry of initialEntries) {
      const movieObject = new Movie(entry.movie);
      await movieObject.save();
      const treasureObject = new Treasure({
        ...entry,
        movie: movieObject._id,
      });
      await treasureObject.save();
    }
  });

  test("treasure entries returned as json", async () => {
    await api
      .get("/treasures")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});

after(async () => {
  await mongoose.connection.close();
});

import { test, before, after, beforeEach, describe } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/utils/app";
import connectToDatabase from "../src/utils/db";
import Treasure from "../src/models/treasure";
import Movie from "../src/models/movie";
import User from "../src/models/user";
import config from "../src/utils/config";
import assert from "node:assert";
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

  test("all entries are returned", async () => {
    const response = await api.get("/treasures");
    assert.strictEqual(response.body.length, 2);
  });

  test("first entry includes movie info", async () => {
    const response = await api.get("/treasures");
    const movies = response.body.map((entry) => entry.movie.title);
    assert(movies.includes("Eyes Wide Shut"));
  });

  test("adding entry without token returns 401", async () => {
    const newEntry = {
      movie: {
        title: "Elf",
        yearReleased: 2003,
        originCountry: "United States of America",
        runTime: 97,
        posterUrl:
          "https://image.tmdb.org/t/p/w154/oOleziEempUPu96jkGs0Pj6tKxj.jpg",
      },
      ratings: [
        {
          user: "Ren",
          rating: 10,
        },
        {
          user: "Patio",
          rating: 10,
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
          rating: 10,
        },
      ],
      ctcstm: 10,
    };

    await api.post("/treasures").send(newEntry).expect(401);
  });

  test("updating entry without token returns 401", async () => {
    const entriesAtStart = await api.get("/treasures");
    const entryToUpdate = entriesAtStart.body[0];

    const updatedEntry = {
      ...entryToUpdate,
      ctcstm: 9.0,
    };

    await api
      .put(`/treasures/${entryToUpdate.id}`)
      .send(updatedEntry)
      .expect(401);
  });

  test("deleting entry without token returns 401", async () => {
    const entriesAtStart = await api.get("/treasures");

    await api.delete(`/treasures/${entriesAtStart.body[0].id}`).expect(401);
  });

  describe("And a user is logged in", () => {
    let token: string;

    before(async () => {
      const loggedUser = await api
        .post("/users/login")
        .send({ username: "testuser1", password: "testpassword" });

      token = loggedUser.body.token;
    });

    test("a valid entry can be added", async () => {
      const newEntry = {
        movie: {
          title: "Elf",
          yearReleased: 2003,
          originCountry: "United States of America",
          runTime: 97,
          posterUrl:
            "https://image.tmdb.org/t/p/w154/oOleziEempUPu96jkGs0Pj6tKxj.jpg",
        },
        ratings: [
          {
            user: "Ren",
            rating: 10,
          },
          {
            user: "Patio",
            rating: 10,
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
            rating: 10,
          },
        ],
        ctcstm: 10,
      };

      await api
        .post("/treasures")
        .set("Authorization", `Bearer ${token}`)
        .send(newEntry)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/treasures");
      assert.strictEqual(response.body.length, initialEntries.length + 1);

      const titles = response.body.map((e) => e.movie.title);
      assert(titles.includes("Elf"));
    });

    test("entry without content is not added", async () => {
      const newEntry = {};

      await api
        .post("/treasures")
        .set("Authorization", `Bearer ${token}`)
        .send(newEntry)
        .expect(400);
    });

    test("an existing entry can be updated", async () => {
      const entriesAtStart = await api.get("/treasures");
      const entryToUpdate = entriesAtStart.body[0];

      const updatedEntry = {
        ...entryToUpdate,
        ctcstm: 9.0,
      };

      await api
        .put(`/treasures/${entryToUpdate.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedEntry)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const refetchedEntry = await Treasure.findById(updatedEntry.id);
      assert.strictEqual(refetchedEntry.ctcstm, 9.0);

      const entriesAtEnd = await api.get("/treasures");
      assert.strictEqual(entriesAtEnd.body.length, entriesAtStart.body.length);
    });

    test("an invalid update returns 400", async () => {
      const entriesAtStart = await api.get("/treasures");
      const entryToUpdate = entriesAtStart.body[0];

      const updatedEntry = {};

      await api
        .put(`/treasures/${entryToUpdate.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedEntry)
        .expect(400);
    });

    test("an existing entry can be deleted", async () => {
      const entriesAtStart = await api.get("/treasures");

      await api
        .delete(`/treasures/${entriesAtStart.body[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const entriesAtEnd = await api.get("/treasures");
      assert.strictEqual(
        entriesAtEnd.body.length,
        entriesAtStart.body.length - 1,
      );
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

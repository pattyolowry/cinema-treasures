import { test, after, before, beforeEach } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from '../src/utils/app';
import connectToDatabase from '../src/utils/db';
import LogEntry from '../src/models/logEntry'
import Movie from '../src/models/movie'
import User from '../src/models/user'
import config from '../src/utils/config'
import assert from 'node:assert'
import bcrypt from 'bcrypt'

const api = supertest(app);

const initialEntries = [
    {
        "clubNumber": 1,
        "movie": {
            "title": "Dog Day Afternoon",
            "yearReleased": 1975,
            "originCountry": "United States of America",
            "runTime": 124,
            "posterUrl": "https://image.tmdb.org/t/p/w154/mavrhr0ig2aCRR8d48yaxtD5aMQ.jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/original/m10uqk0HI5JcITAbxNJIIiGA8HP.jpg",
            "mpaaRating": "R"
        },
        "monthWatched": "January",
        "yearWatched": 2023,
        "streamingPlatform": "Criterion",
        "ratings": [
            {
                "user": "Ren",
                "rating": 10,
            },
            {
                "user": "Patio",
                "rating": 9,
            },
            {
                "user": "Greg",
                "rating": 9,
            },
            {
                "user": "Max",
                "rating": 10,
            },
            {
                "user": "Quinn",
                "rating": 10,
            }
        ],
        "averageRating": 9.6,
        "pickedBy": "Ren"
    },
    {
        "clubNumber": 2,
        "movie": {
            "title": "Sorcerer",
            "yearReleased": 1977,
            "originCountry": "United States of America",
            "runTime": 122,
            "posterUrl": "https://image.tmdb.org/t/p/w154/2b7oexm173SF1FSEq0DdgxZZNRH.jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/original/g7prwSflNODkHZI6792MYoU4qoh.jpg",
        },
        "monthWatched": "April",
        "yearWatched": 2025,
        "streamingPlatform": "Amazon Prime",
        "ratings": [
            {
                "user": "Ren",
                "rating": 5,
            },
            {
                "user": "Patio",
                "rating": 6,
            },
            {
                "user": "Greg",
                "rating": 7,
            },
            {
                "user": "Max",
                "rating": 8,
            },
            {
                "user": "Quinn",
                "rating": 9,
            }
        ],
        "averageRating": 7,
        "pickedBy": "Quinn"
    }
]

before(async () => {
  await connectToDatabase(config.MONGODB_URI);
});

beforeEach(async () => {
  await Movie.deleteMany({});
  await LogEntry.deleteMany({});
  await User.deleteMany({});

  const saltRounds = 10
  const passwordHash = await bcrypt.hash("testpassword", saltRounds)

  const userObject = new User({
    "name": "Test User 1",
    "username": "testuser1",
    "passwordHash": passwordHash
  });

  await userObject.save();

  for (const entry of initialEntries) {
    const movieObject = new Movie(entry.movie);
    await movieObject.save();
    const entryObject = new LogEntry({
        ...entry,
        movie: movieObject._id
    });
    await entryObject.save();
  }
})

test("film log entries returned as json", async () => {
  await api
    .get("/history")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all entries are returned", async () => {
    const response = await api.get("/history");
    assert.strictEqual(response.body.length, 2)
});

test("first entry includes movie info", async () => {
    const response = await api.get('/history');
    const movies = response.body.map((entry) => entry.movie.title);
    assert(movies.includes('Dog Day Afternoon'));
});

test("a valid entry can be added", async () => {
    const loggedUser = await api
        .post("/users/login")
        .send({"username": "testuser1", "password": "testpassword"})

    const token = loggedUser.body.token

    const newEntry = {
        "clubNumber": 3,
        "movie": {
            "title": "After Yang",
            "yearReleased": 2022,
            "originCountry": "United States of America",
            "runTime": 96,
            "posterUrl": "https://image.tmdb.org/t/p/w154/qjEuDeKOhA7JqaaqhLSfoS9titb.jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/original/y8ZholsWIn4jR3JoDWOSSFY87vf.jpg",
        },
        "yearWatched": 2024,
        "streamingPlatform": "Tubi",
        "ratings": [],
        "pickedBy": "Patio"
    }

    await api
        .post("/history")
        .set("Authorization", `Bearer ${token}`)
        .send(newEntry)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api.get("/history");
    assert.strictEqual(response.body.length, initialEntries.length + 1)

    const titles = response.body.map(e => e.movie.title);
    assert(titles.includes("After Yang"));
});

test("adding entry without token returns 401", async () => {
    const newEntry = {
        "clubNumber": 3,
        "movie": {
            "title": "After Yang",
            "yearReleased": 2022,
            "originCountry": "United States of America",
            "runTime": 96,
            "posterUrl": "https://image.tmdb.org/t/p/w154/qjEuDeKOhA7JqaaqhLSfoS9titb.jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/original/y8ZholsWIn4jR3JoDWOSSFY87vf.jpg",
        },
        "yearWatched": 2024,
        "streamingPlatform": "Tubi",
        "ratings": [],
        "pickedBy": "Patio"
    }

    await api
        .post("/history")
        .send(newEntry)
        .expect(401)
})

after(async () => {
  await mongoose.connection.close();
});

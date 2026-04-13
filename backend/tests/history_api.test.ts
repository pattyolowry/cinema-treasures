import { test, after, beforeEach } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from '../src/utils/app';
import connectToDatabase from '../src/utils/db';
import LogEntry from '../src/models/logEntry'
import Movie from '../src/models/movie'
import config from '../src/utils/config'

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
    }  
]

const loadMongo = async () => {
    await connectToDatabase(config.MONGODB_URI)
}

loadMongo();

beforeEach(async () => {
  await Movie.deleteMany({});
  await LogEntry.deleteMany({});
  let movieObject = new Movie(initialEntries[0].movie)
  await movieObject.save()
  let entryObject = new LogEntry({
    ...initialEntries[0],
    movie: movieObject._id
})
  await entryObject.save()
})

test("film log entries returned as json", async () => {
  await api
    .get("/history")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

after(async () => {
  await mongoose.connection.close();
});

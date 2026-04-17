import { test, after, before, beforeEach, describe } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/utils/app";
import connectToDatabase from "../src/utils/db";
import AwardYear from "../src/models/award";
import User from "../src/models/user";
import config from "../src/utils/config";
import assert from "node:assert";
import bcrypt from "bcrypt";

const api = supertest(app);

const initialAwards = [
  {
    year: 2025,
    categories: [
      {
        name: "Visible Award",
        isVisible: true,
        nominees: [
          {
            name: "Michael Fassbender",
            subText: "Black Bag (2024)",
          },
          {
            name: "Josh O'Connor",
            subText: "God's Own Country (2017)",
          },
          {
            name: "Nobuko Otowa",
            subText: "Onibaba (1964)",
          },
          {
            name: "Ethan Hawke",
            subText: "First Reformed (2017)",
            isWinner: true,
          },
          {
            name: "Robin Williams",
            subText: "Awakenings (1990)",
          },
        ],
      },
      {
        name: "Hidden Award",
        isVisible: false,
        nominees: [
          {
            name: "Orson Welles",
            subText: "Touch of Evil (1958)",
          },
          {
            name: "Dan Hedaya",
            subText: "The Hurricane (1999)",
          },
          {
            name: "Elle Graham",
            subText: "Are You There God? It's Me, Margaret. (2023)",
          },
          {
            name: "Rudolf Hrusínský",
            subText: "The Cremator (1969)",
            isWinner: true,
          },
          {
            name: "The Hill",
            subText: "The Hill (1965)",
          },
        ],
      },
    ],
  },
];

before(async () => {
  await connectToDatabase(`${config.MONGODB_URI}/testAwards`);
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

describe("When there are initially some awards saved", () => {
  beforeEach(async () => {
    await AwardYear.deleteMany({});

    for (const entry of initialAwards) {
      const awardObject = new AwardYear(entry);
      await awardObject.save();
    }
  });
});

after(async () => {
  await mongoose.connection.close();
});

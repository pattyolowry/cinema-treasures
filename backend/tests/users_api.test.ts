import { test, before, after } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/utils/app";
import connectToDatabase from "../src/utils/db";
import User from "../src/models/user";
import config from "../src/utils/config";
import assert from "node:assert";
import bcrypt from "bcrypt";

const api = supertest(app);

const testUser = {
  name: "Test User 1",
  username: "testuser1",
  password: "testpassword",
};

before(async () => {
  await connectToDatabase(config.MONGODB_URI);
  await User.deleteMany({});
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

  const userObject = new User({
    name: testUser.name,
    username: testUser.username,
    passwordHash: passwordHash,
  });

  await userObject.save();
});

test("User can log in", async () => {
  const response = await api.post("/users/login").send({
    username: testUser.username,
    password: testUser.password,
  });

  assert.strictEqual(response.status, 200);
  assert.ok("token" in response.body);
});

test("Incorrect username returns error", async () => {
  await api
    .post("/users/login")
    .send({
      username: "wrongusername",
      password: testUser.password,
    })
    .expect(400);
});

test("Incorrect password returns error", async () => {
  await api
    .post("/users/login")
    .send({
      username: testUser.username,
      password: "wrongpassword",
    })
    .expect(400);
});

test("Creating user without token returns error", async () => {
  await api
    .post("/users")
    .send({
      name: "New User",
      username: "newuser",
      password: "newpassword",
    })
    .expect(401);
});

test("Non-admin cannot create user", async () => {
  const response = await api.post("/users/login").send({
    username: testUser.username,
    password: testUser.password,
  });

  const token = response.body.token;

  await api
    .post("/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "New User",
      username: "newuser",
      password: "newpassword",
    })
    .expect(401);
});

test("Admin can create user", async () => {
  const adminUser = {
    name: "Admin User",
    username: "adminuser",
    password: "adminpassword",
  };

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminUser.password, saltRounds);

  const adminObject = new User({
    name: adminUser.name,
    username: adminUser.username,
    passwordHash: passwordHash,
    admin: true,
  });

  await adminObject.save();

  const usersBefore = await User.find({});

  const response = await api.post("/users/login").send({
    username: adminUser.username,
    password: adminUser.password,
  });

  const token = response.body.token;

  await api
    .post("/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "New User",
      username: "newuser",
      password: "newpassword",
    })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const usersAfter = await User.find({});

  assert.strictEqual(usersAfter.length, usersBefore.length + 1);
});

after(async () => {
  await mongoose.connection.close();
});

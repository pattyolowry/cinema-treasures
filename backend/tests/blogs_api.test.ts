import { test, after, before, beforeEach, describe } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/utils/app";
import connectToDatabase from "../src/utils/db";
import Blog from "../src/models/blog";
import User from "../src/models/user";
import config from "../src/utils/config";
import assert from "node:assert";
import bcrypt from "bcrypt";

const api = supertest(app);

const initialBlogs = [
  {
    title: "Lifetime Achievement Award 2024",
    authors: ["Quinn"],
    url: "https://cinematreasures.club/blog/dummyblog",
    imageKey: "ct/image/dummykey.jpg",
    date: "2025-01-20",
  },
  {
    title: "Best Movies for Every Season",
    authors: ["Max"],
    url: "https://cinematreasures.club/blog/dummyblog2",
    imageKey: "ct/image/dummykey2.jpg",
    date: "2025-12-19",
  },
];

before(async () => {
  await connectToDatabase(`${config.MONGODB_URI}/testBlogs`);
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

describe("When there are initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    for (const blog of initialBlogs) {
      const blogObject = new Blog(blog);
      await blogObject.save();
    }
  });

  test("fetching blogs without token returns error", async () => {
    await api.get("/blogs").expect(401);
  });

  test("adding blog without token returns error", async () => {
    const newBlog = {
      title: "LOTR",
      authors: ["Quinn", "Max"],
      url: "https://cinematreasures.club/blog/dummyblog3",
      imageKey: "ct/image/dummykey3.jpg",
      date: "2026-04-18",
    };
    await api.post("/blogs").send(newBlog).expect(401);
  });

  describe("and a user is logged in", () => {
    let token: string;

    before(async () => {
      const loggedUser = await api
        .post("/users/login")
        .send({ username: "testuser1", password: "testpassword" });

      token = loggedUser.body.token;
    });

    test("blogs returned as json", async () => {
      await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      assert.strictEqual(response.body.length, initialBlogs.length);
    });

    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "LOTR",
        authors: ["Quinn", "Max"],
        url: "https://cinematreasures.club/blog/dummyblog3",
        date: "2026-04-18",
      };
      await api
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const response = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);

      assert.strictEqual(response.body.length, initialBlogs.length + 1);
      const titles = response.body.map((b) => b.title);
      assert(titles.includes("LOTR"));
    });

    test("a blog without content is not added", async () => {
      const newBlog = {};
      await api
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });

    test("a blog can be updated", async () => {
      const blogsAtStart = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      const blogToUpdate = blogsAtStart.body[0];

      const updatedBlog = {
        title: "Updated Title",
        authors: blogToUpdate.authors,
        url: blogToUpdate.url,
        date: blogToUpdate.date.split("T")[0],
      };

      await api
        .put(`/blogs/${blogToUpdate.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const refetchedBlog = await Blog.findById(blogToUpdate.id);
      assert.strictEqual(refetchedBlog.title, "Updated Title");

      const blogsAtEnd = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length);
    });

    test("an invalid update returns 400", async () => {
      const blogsAtStart = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      const blogToUpdate = blogsAtStart.body[0];

      const updatedBlog = {};

      await api
        .put(`/blogs/${blogToUpdate.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedBlog)
        .expect(400);
    });

    test("updating blog without token returns 401", async () => {
      const blogsAtStart = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      const blogToUpdate = blogsAtStart.body[0];

      const updatedBlog = {
        ...blogToUpdate,
        title: "Updated Title",
      };

      await api.put(`/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(401);
    });

    test("a blog can be deleted", async () => {
      const blogsAtStart = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);

      await api
        .delete(`/blogs/${blogsAtStart.body[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);
      assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1);
    });

    test("deleting a blog without token returns 401", async () => {
      const blogsAtStart = await api
        .get("/blogs")
        .set("Authorization", `Bearer ${token}`);

      await api.delete(`/blogs/${blogsAtStart.body[0].id}`).expect(401);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

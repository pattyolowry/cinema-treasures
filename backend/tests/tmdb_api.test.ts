import { test } from "node:test";
import supertest from "supertest";
import app from "../src/utils/app";

const api = supertest(app);

test("Search returns 401 for unauthenticated user", async () => {
  await api.get("/tmdb/search/movie?query=Elf").expect(401);
});

test("Details returns 401 for unauthenticated user", async () => {
  await api.get("/tmdb/movie/10719").expect(401);
});

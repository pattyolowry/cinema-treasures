import express from "express";
import blogService from "../services/blogService";
import middleware from "../utils/middleware";

const router = express.Router();

router.get("/", middleware.userExtractor, async (_req, res) => {
  const allBlogs = await blogService.getBlogs();
  res.send(allBlogs);
});

export default router;

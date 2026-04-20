import express from "express";
import blogService from "../services/blogService";
import middleware from "../utils/middleware";
import multer from "multer";
import sharp from "sharp";
import { newBlogSchema } from "../utils/schemas";
import { Response, Request, NextFunction } from "express";
import { NewBlog, IdParams } from "../types";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 },
});

router.get("/", middleware.userExtractor, async (_req, res) => {
  const allBlogs = await blogService.getBlogs();
  res.send(allBlogs);
});

const newBlogParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    newBlogSchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

router.post(
  "/",
  middleware.userExtractor,
  upload.single("image"),
  newBlogParser,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ error: "No file provided" });
      }

      const metadata = await sharp(req.file.buffer).metadata();

      if (!metadata.width || !metadata.height) {
        return res.status(400).send({ error: "Invalid image" });
      }

      const aspectRatio = metadata.width / metadata.height;
      if (Math.abs(aspectRatio - 16 / 9) > 0.01) {
        return res.status(400).send("Image must be 16:9");
      }

      const imageKey = await blogService.uploadImage(req.file);

      const newBlog = await blogService.addBlog({
        title: req.body.title,
        authors: req.body.authors,
        url: req.body.url,
        date: req.body.date,
        imageKey,
      });

      return res.json(newBlog);
    } catch (err) {
      console.log(err);
      return res.status(400).send({ error: "Error saving blog" });
    }
  },
);

router.put(
  "/:id",
  middleware.userExtractor,
  newBlogParser,
  async (req: Request<IdParams, unknown, NewBlog>, res: Response) => {
    try {
      const updatedBlog = await blogService.updateBlog(req.params.id, req.body);
      return res.json(updatedBlog);
    } catch (error) {
      let errorMessage = "Something went wrong.";
      if (error instanceof Error) {
        if (error.message === "Not found") {
          return res.status(404).end();
        } else {
          errorMessage += " Error: " + error.message;
        }
      }
      return res.status(400).send({ error: errorMessage });
    }
  },
);

router.delete("/:id", middleware.userExtractor, async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id as string);
    res.status(204).end();
  } catch (error: unknown) {
    let errorMessage = "Something went wrong.";
    if (error instanceof Error) {
      errorMessage += " Error: " + error.message;
    }
    res.status(400).send({ error: errorMessage });
  }
});

export default router;

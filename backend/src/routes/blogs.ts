import express from "express";
import blogService from "../services/blogService";
import middleware from "../utils/middleware";
import multer from "multer";
import sharp from "sharp";

const router = express.Router();

// const storage = multer.diskStorage({
//   destination: function (_req, _file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (_req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 },
});

router.get("/", middleware.userExtractor, async (_req, res) => {
  const allBlogs = await blogService.getBlogs();
  res.send(allBlogs);
});

router.post(
  "/",
  middleware.userExtractor,
  upload.single("image"),
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

      const imagePath = await blogService.uploadImage(req.file);

      return res.status(200).send({ imagePath });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ error: "Error processing image" });
    }
  },
);

export default router;

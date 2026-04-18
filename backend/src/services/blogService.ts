import { PutObjectCommand } from "@aws-sdk/client-s3";
import Blog from "../models/blog";
import { s3 } from "../utils/aws";

const getBlogs = async () => {
  const allBlogs = await Blog.find({});
  return allBlogs;
};

const uploadImage = async (file: Express.Multer.File) => {
  const filename = Date.now() + "-" + file.originalname;
  await s3.send(
    new PutObjectCommand({
      Bucket: "cinema-treasures-images",
      Key: `images/blogs/${filename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://cinematreasures.club/images/blogs/${filename}`;
};

export default {
  getBlogs,
  uploadImage,
};

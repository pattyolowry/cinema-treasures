import { PutObjectCommand } from "@aws-sdk/client-s3";
import Blog from "../models/blog";
import { s3 } from "../utils/aws";
import { NewBlog } from "../types";

const getBlogs = async () => {
  const allBlogs = await Blog.find({});
  return allBlogs;
};

const uploadImage = async (file: Express.Multer.File) => {
  const filename = Date.now() + "-" + file.originalname;
  const key = `images/blogs/${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: "cinema-treasures-images",
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return key;
};

const addBlog = async (blog: NewBlog) => {
  const newBlog = new Blog(blog);
  return await newBlog.save();
};

export default {
  getBlogs,
  uploadImage,
  addBlog,
};

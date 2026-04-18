import Blog from "../models/blog";

const getBlogs = async () => {
  const allBlogs = await Blog.find({});
  return allBlogs;
};

export default {
  getBlogs,
};

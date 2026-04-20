import axios from "axios";
import utils from "./utils";
import { Blog, NewBlog } from "../types";

const baseUrl = `${utils.backendUrl()}/blogs`;

const getAllBlogs = async () => {
  const { data } = await axios.get<Blog[]>(baseUrl, utils.getAuthConfig());

  return data;
};

const addBlog = async (file: File | null, blog: NewBlog) => {
  const formData = new FormData();

  if (file) {
    formData.append("image", file);
  }

  formData.append("title", blog.title);
  formData.append("authors", JSON.stringify(blog.authors));
  formData.append("url", blog.url);
  formData.append("date", blog.date.toISOString());

  if (blog.shortDescription) {
    formData.append("shortDescription", blog.shortDescription);
  }

  const { data } = await axios.post<Blog>(
    baseUrl,
    formData,
    utils.getAuthConfig(),
  );

  return data;
};

const updateBlog = async (id: string, blog: NewBlog) => {
  const { data } = await axios.put<Blog>(
    `${baseUrl}/${id}`,
    blog,
    utils.getAuthConfig(),
  );

  return data;
};

const deleteBlog = async (id: string) => {
  const { data } = await axios.delete(
    `${baseUrl}/${id}`,
    utils.getAuthConfig(),
  );

  return data;
};

export default {
  getAllBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
};

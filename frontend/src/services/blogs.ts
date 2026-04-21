import axios from "axios";
import utils from "./utils";
import { Blog, NewBlog } from "../types";

const baseUrl = `${utils.backendUrl()}/blogs`;
const formatDateForApi = (date: Date) => date.toISOString().slice(0, 10);

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
  for (const author of blog.authors) {
    formData.append("authors", author);
  }
  formData.append("url", blog.url);
  formData.append("date", formatDateForApi(blog.date));

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
    {
      ...blog,
      date: formatDateForApi(blog.date),
    },
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

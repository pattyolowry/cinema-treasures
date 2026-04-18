import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [
    {
      type: String,
      enum: {
        values: ["Ren", "Greg", "Max", "Quinn", "Patio", "Ian"],
        message: "{VALUE} is not a valid user",
      },
    },
  ],
  url: String,
  date: Date,
  imagePath: String,
  shortDescription: String,
});

blogSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;

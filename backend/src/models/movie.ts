import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  yearReleased: Number,
  originCountry: String,
  runTime: Number,
  mpaaRating: String,
  tmdbId: Number,
  posterUrl: String,
  backdropUrl: String,
  overview: String,
  tmdbRating: Number,
  genres: [String],
  language: String,
});

movieSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;

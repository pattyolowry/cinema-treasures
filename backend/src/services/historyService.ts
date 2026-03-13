import LogEntry from '../models/logEntry'
import Movie from '../models/movie'
import { NewLogEntry } from '../types'

const getHistory = async () => {
    const fullHistory = await LogEntry.find({})
    return fullHistory
}

const addEntry = async (entry: NewLogEntry) => {
    let movie = await Movie.findOne({title: entry.movie.title})
    if (movie) {
        movie.set(entry.movie)
    } else {
        movie = new Movie({
            ...entry.movie
        })
    }

    await movie.save();

    const newLogEntry = new LogEntry({
        ...entry,
        movie: movie._id
    })

    const addedEntry = await newLogEntry.save();
    return await addedEntry.populate("movie")
}

export default {
  getHistory,
  addEntry
};
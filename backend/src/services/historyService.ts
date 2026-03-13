import LogEntry from '../models/logEntry'
import Movie from '../models/movie'
import { NewLogEntry } from '../types'

const getHistory = async () => {
    const fullHistory = await LogEntry.find({}).populate("movie")
    return fullHistory
}

const findAndUpdateLinkedMovie = async (entry: NewLogEntry) => {
    let movie = await Movie.findOne({title: entry.movie.title})
    if (movie) {
        movie.set(entry.movie)
    } else {
        movie = new Movie({
            ...entry.movie
        })
    }

    return await movie.save();
}

const addEntry = async (entry: NewLogEntry) => {
    const movie = await findAndUpdateLinkedMovie(entry)

    const newLogEntry = new LogEntry({
        ...entry,
        movie: movie._id
    })

    const addedEntry = await newLogEntry.save();
    return await addedEntry.populate("movie")
}

const updateEntry = async (id: string, entry: NewLogEntry) => {
    const logEntry = await LogEntry.findById(id)
    if (!logEntry) {
        throw Error("Not found")
    } else {
        const movie = await findAndUpdateLinkedMovie(entry)

        logEntry.set({
            ...entry,
            movie: movie._id
        })

        const updatedEntry = await logEntry.save()
        return await updatedEntry.populate("movie")
    }
}

const deleteEntry = async (id: string) => {
    return await LogEntry.findByIdAndDelete(id)
}

export default {
  getHistory,
  addEntry,
  updateEntry,
  deleteEntry
};

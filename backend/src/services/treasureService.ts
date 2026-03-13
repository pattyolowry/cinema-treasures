import Treasure from '../models/treasure'
import Movie from '../models/movie'
import { NewTreasure } from '../types'

const getAll = async () => {
    const allTreasures = await Treasure.find({}).populate("movie")
    return allTreasures
}

const findAndUpdateLinkedMovie = async (entry: NewTreasure) => {
    let movie = await Movie.findOne({title: entry.movie.title})
    if (movie) {
        movie.yearReleased = entry.movie.yearReleased
        movie.originCountry = entry.movie.originCountry
        movie.runTime = entry.movie.runTime
        movie.mpaaRating = entry.movie.mpaaRating
        movie.posterUrl = entry.movie.posterUrl
    } else {
        movie = new Movie({
            ...entry.movie
        })
    }

    return await movie.save();
}

const addTreasure = async (treasure: NewTreasure) => {
    const movie = await findAndUpdateLinkedMovie(treasure)

    const newTreasure = new Treasure({
        ...treasure,
        movie: movie._id
    })

    const addedTreasure = await newTreasure.save();
    return await addedTreasure.populate("movie")
}

// const updateEntry = async (id: string, entry: NewLogEntry) => {
//     const logEntry = await LogEntry.findById(id)
//     if (!logEntry) {
//         throw Error("Not found")
//     } else {
//         const movie = await findAndUpdateLinkedMovie(entry)

//         logEntry.set({
//             ...entry,
//             movie: movie._id
//         })

//         const updatedEntry = await logEntry.save()
//         return await updatedEntry.populate("movie")
//     }
// }

// const deleteEntry = async (id: string) => {
//     return await LogEntry.findByIdAndDelete(id)
// }

export default {
  getAll,
  addTreasure
};

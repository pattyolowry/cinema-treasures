import mongoose from 'mongoose';

const logEntrySchema = new mongoose.Schema({
    clubNumber: {type: Number, required: true},
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    yearWatched: Number,
    streamingPlatform: String,
    ratings: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            rating: Number
        }
    ]
})

logEntrySchema.set("toJSON", {
    transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
})

const LogEntry = mongoose.model("LogEntry", logEntrySchema);
export default LogEntry;
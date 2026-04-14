import mongoose from 'mongoose';

const logEntrySchema = new mongoose.Schema({
    clubNumber: {type: Number, required: true},
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    pickedBy: {
        type: String,
        enum: {
            values: ["Ren", "Greg", "Max", "Quinn", "Patio", "Ian"],
            message: '{VALUE} is not a valid user'
        }
    },
    monthWatched: {
        type: String,
        enum: {
            values: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            message: '{VALUE} is not a valid user'
        }
    },
    yearWatched: Number,
    streamingPlatform: String,
    ratings: [
        {
            user: {
                type: String,
                enum: {
                    values: ["Ren", "Greg", "Max", "Quinn", "Patio", "Ian"],
                    message: '{VALUE} is not a valid user'
                }
            },
            rating: Number
        }
    ],
    averageRating: Number,
    notes: String
});

logEntrySchema.set("toJSON", {
    transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const LogEntry = mongoose.model("LogEntry", logEntrySchema);
export default LogEntry;
import mongoose from 'mongoose';

const treasureSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
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
    ctcstm: Number
})

treasureSchema.set("toJSON", {
    transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
})

const Treasure = mongoose.model("Treasure", treasureSchema);
export default Treasure;
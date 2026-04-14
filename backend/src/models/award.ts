import mongoose from 'mongoose';

const awardYearSchema = new mongoose.Schema({
    year: Number,
    categories: [{
        name: String,
        isVisible: Boolean,
        nominees: [{
            name: String,
            isWinner: Boolean,
            subText: String
        }]
    }]
});

awardYearSchema.set("toJSON", {
    transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const AwardYear = mongoose.model("AwardYear", awardYearSchema);
export default AwardYear;